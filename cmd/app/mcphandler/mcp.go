package mcphandler

import (
	"context"
	"fmt"
	"strings"
	"sync"

	"github.com/google/uuid"
	mcpgo "github.com/mark3labs/mcp-go/mcp"
	mcpsrv "github.com/mark3labs/mcp-go/server"
	"github.com/xichan96/prompt-hub/internal/appdto"
	"github.com/xichan96/prompt-hub/internal/di"
)

var (
	activeSkillID string
	activeSkillMu sync.RWMutex
)

func NewMcpHandler() *mcpsrv.StreamableHTTPServer {
	s := mcpsrv.NewMCPServer(
		"prompt-hub-mcp",
		"1.0.0",
		mcpsrv.WithLogging(),
		mcpsrv.WithToolCapabilities(true),
	)
	registerTools(s)
	return mcpsrv.NewStreamableHTTPServer(
		s,
		mcpsrv.WithEndpointPath("/mcp"),
	)
}

func registerTools(s *mcpsrv.MCPServer) {
	s.AddTool(
		mcpgo.NewTool(
			"activate_skill",
			mcpgo.WithDescription("Activate a skill to be used by subsequent tools"),
			mcpgo.WithString("skill_id", func(prop map[string]any) {
				prop["description"] = "Skill ID to activate"
			}, mcpgo.Required()),
		),
		activateSkillHandler,
	)
	s.AddTool(
		mcpgo.NewTool(
			"list_skill_files",
			mcpgo.WithDescription("List files under a skill"),
			mcpgo.WithString("skill_id", func(prop map[string]any) {
				prop["description"] = "Skill ID (optional if activated)"
			}),
		),
		listSkillFilesHandler,
	)
	s.AddTool(
		mcpgo.NewTool(
			"get_skill_file",
			mcpgo.WithDescription("Get a specific skill file by ID or Name"),
			mcpgo.WithString("file_id", func(prop map[string]any) {
				prop["description"] = "File ID"
			}),
			mcpgo.WithString("name", func(prop map[string]any) {
				prop["description"] = "File Name (required if file_id is not provided)"
			}),
			mcpgo.WithString("skill_id", func(prop map[string]any) {
				prop["description"] = "Skill ID (required if Name is used and no active skill)"
			}),
		),
		getSkillFileHandler,
	)
	s.AddTool(
		mcpgo.NewTool(
			"list_prompts",
			mcpgo.WithDescription("List available prompts from Prompt Hub"),
			mcpgo.WithString("skill_id", func(prop map[string]any) {
				prop["description"] = "Filter by Skill ID"
			}),
			mcpgo.WithString("status", func(prop map[string]any) {
				prop["description"] = "Filter by status (draft, published, archived)"
			}),
		),
		listPromptsHandler,
	)

	s.AddTool(
		mcpgo.NewTool(
			"get_prompt",
			mcpgo.WithDescription("Get a specific prompt by ID or Name"),
			mcpgo.WithString("id", func(prop map[string]any) {
				prop["description"] = "Prompt ID"
			}),
			mcpgo.WithString("name", func(prop map[string]any) {
				prop["description"] = "Prompt Name (required if ID is not provided)"
			}),
			mcpgo.WithString("skill_id", func(prop map[string]any) {
				prop["description"] = "Skill ID (required if Name is used)"
			}),
		),
		getPromptHandler,
	)

	s.AddTool(
		mcpgo.NewTool(
			"run_agent",
			mcpgo.WithDescription("Execute a prompt as an agent on the server. This uses the prompt's configuration (model, temperature, etc.) to run the agent remotely."),
			mcpgo.WithString("prompt_id", func(prop map[string]any) {
				prop["description"] = "Prompt ID to execute"
			}),
			mcpgo.WithString("name", func(prop map[string]any) {
				prop["description"] = "Prompt Name (required if ID is not provided)"
			}),
			mcpgo.WithString("skill_id", func(prop map[string]any) {
				prop["description"] = "Skill ID (required if Name is used)"
			}),
			mcpgo.WithString("message", func(prop map[string]any) {
				prop["description"] = "Input message for the agent"
			}, mcpgo.Required()),
		),
		runAgentHandler,
	)
}

func withActiveSkillID(id string) (string, error) {
	if strings.TrimSpace(id) != "" {
		return id, nil
	}
	activeSkillMu.RLock()
	defer activeSkillMu.RUnlock()
	if strings.TrimSpace(activeSkillID) == "" {
		return "", fmt.Errorf("skill_id required: no active skill set")
	}
	return activeSkillID, nil
}

func activateSkillHandler(ctx context.Context, req mcpgo.CallToolRequest) (*mcpgo.CallToolResult, error) {
	skillID, err := req.RequireString("skill_id")
	if err != nil || strings.TrimSpace(skillID) == "" {
		return mcpgo.NewToolResultError("invalid skill_id"), nil
	}
	activeSkillMu.Lock()
	activeSkillID = skillID
	activeSkillMu.Unlock()
	return mcpgo.NewToolResultText("skill activated"), nil
}

func listSkillFilesHandler(ctx context.Context, req mcpgo.CallToolRequest) (*mcpgo.CallToolResult, error) {
	args, _ := req.Params.Arguments.(map[string]interface{})
	skillID, _ := args["skill_id"].(string)
	id, err := withActiveSkillID(skillID)
	if err != nil {
		return mcpgo.NewToolResultError(err.Error()), nil
	}
	files, err := di.SkillFileApp.GetSkillFileList(ctx, id)
	if err != nil {
		return mcpgo.NewToolResultError(fmt.Sprintf("Failed to list skill files: %v", err)), nil
	}
	return mcpgo.NewToolResultStructuredOnly(files), nil
}

func getSkillFileHandler(ctx context.Context, req mcpgo.CallToolRequest) (*mcpgo.CallToolResult, error) {
	args, _ := req.Params.Arguments.(map[string]interface{})
	fileID, _ := args["file_id"].(string)
	name, _ := args["name"].(string)
	skillID, _ := args["skill_id"].(string)

	var sid string
	if strings.TrimSpace(fileID) == "" {
		var err error
		sid, err = withActiveSkillID(skillID)
		if err != nil {
			return mcpgo.NewToolResultError(err.Error()), nil
		}
		if strings.TrimSpace(name) == "" {
			return mcpgo.NewToolResultError("either file_id or name is required"), nil
		}
	}
	reqDTO := &appdto.GetPromptReq{}
	_ = reqDTO
	fileReq := &appdto.GetSkillFileReq{
		ID:      fileID,
		Name:    name,
		SkillID: sid,
	}
	file, err := di.SkillFileApp.GetSkillFile(ctx, fileReq)
	if err != nil {
		return mcpgo.NewToolResultError(fmt.Sprintf("Failed to get skill file: %v", err)), nil
	}
	return mcpgo.NewToolResultStructuredOnly(file), nil
}

func listPromptsHandler(ctx context.Context, req mcpgo.CallToolRequest) (*mcpgo.CallToolResult, error) {
	args, _ := req.Params.Arguments.(map[string]interface{})
	skillID, _ := args["skill_id"].(string)
	status, _ := args["status"].(string)

	promptApp := di.PromptApp
	prompts, err := promptApp.GetPromptList(ctx, skillID, "", status)
	if err != nil {
		return mcpgo.NewToolResultError(fmt.Sprintf("Failed to list prompts: %v", err)), nil
	}

	var b strings.Builder
	b.WriteString("提示词数量：")
	b.WriteString(fmt.Sprintf("%d", len(prompts)))
	if len(prompts) > 0 {
		b.WriteString("\n技能/名称：")
		for i, p := range prompts {
			if i > 0 {
				b.WriteString("；")
			}
			b.WriteString(p.SkillID)
			b.WriteString("/")
			b.WriteString(p.Name)
		}
	}
	return mcpgo.NewToolResultText(b.String()), nil
}

func getPromptHandler(ctx context.Context, req mcpgo.CallToolRequest) (*mcpgo.CallToolResult, error) {
	args, _ := req.Params.Arguments.(map[string]interface{})
	id, _ := args["id"].(string)
	name, _ := args["name"].(string)
	skillID, _ := args["skill_id"].(string)

	sid, err := withActiveSkillID(skillID)
	if err != nil {
		return mcpgo.NewToolResultError(err.Error()), nil
	}
	promptApp := di.PromptApp
	promptReq := &appdto.GetPromptReq{
		ID:      id,
		Name:    name,
		SkillID: sid,
	}

	prompt, err := promptApp.GetPrompt(ctx, promptReq)
	if err != nil {
		return mcpgo.NewToolResultError(fmt.Sprintf("Failed to get prompt: %v", err)), nil
	}

	combined := combinePromptWithSkillFiles(ctx, sid, prompt.Content)
	return mcpgo.NewToolResultText(fmt.Sprintf("Prompt Content:\n%s\n\nConfig:\n%s", combined, prompt.Config)), nil
}

func runAgentHandler(ctx context.Context, req mcpgo.CallToolRequest) (*mcpgo.CallToolResult, error) {
	args, _ := req.Params.Arguments.(map[string]interface{})
	promptID, _ := args["prompt_id"].(string)
	name, _ := args["name"].(string)
	skillID, _ := args["skill_id"].(string)
	message, _ := args["message"].(string)

	sid, err := withActiveSkillID(skillID)
	if err != nil {
		return mcpgo.NewToolResultError(err.Error()), nil
	}
	promptApp := di.PromptApp
	getReq := &appdto.GetPromptReq{
		ID:      promptID,
		Name:    name,
		SkillID: sid,
	}

	prompt, err := promptApp.GetPrompt(ctx, getReq)
	if err != nil {
		return mcpgo.NewToolResultError(fmt.Sprintf("Failed to get prompt: %v", err)), nil
	}

	combined := combinePromptWithSkillFiles(ctx, sid, prompt.Content)
	agentApp := di.AgentApp
	sessionID := uuid.New().String()
	engine, err := agentApp.Engine(sessionID, combined, prompt.Config)
	if err != nil {
		return mcpgo.NewToolResultError(fmt.Sprintf("Failed to create agent engine: %v", err)), nil
	}

	result, err := engine.Execute(message, nil)
	if err != nil {
		return mcpgo.NewToolResultError(fmt.Sprintf("Failed to execute agent: %v", err)), nil
	}

	return mcpgo.NewToolResultText(result.Output), nil
}

func combinePromptWithSkillFiles(ctx context.Context, skillID string, content string) string {
	files, err := di.SkillFileApp.GetSkillFileList(ctx, skillID)
	if err != nil || len(files) == 0 {
		return content
	}
	var b strings.Builder
	b.WriteString(content)
	b.WriteString("\n\n")
	b.WriteString("# 技能文件列表（渐进式披露）\n")
	b.WriteString("- 以下为可用的技能文件清单（名称与简述）。\n")
	b.WriteString("- 当需要某个文件的具体内容时，再明确提出文件名以获取。\n\n")
	for _, f := range files {
		name := strings.TrimSpace(f.Name)
		desc := strings.TrimSpace(f.Description)
		if desc == "" {
			desc = "无描述"
		}
		b.WriteString("- ")
		b.WriteString(name)
		b.WriteString("：")
		b.WriteString(desc)
		b.WriteString("\n")
	}
	return b.String()
}
