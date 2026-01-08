package handler

import (
	"bytes"
	"errors"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/xichan96/cortex/trigger/http"
	"github.com/xichan96/prompt-hub/internal/appdto"
	"github.com/xichan96/prompt-hub/internal/di"
	"github.com/xichan96/prompt-hub/pkg/web/cctx"
	"github.com/xichan96/prompt-hub/pkg/web/gx"
)

// Helper function to check skill access
func checkSkillAccess(c *gin.Context, skillID string) error {
	if skillID == "" {
		return nil
	}
	userRole := cctx.GetUserRole[string](c)
	if userRole == "admin" {
		return nil
	}
	skill, err := di.SkillApp.GetSkill(c, skillID)
	if err != nil {
		return err
	}
	userID := cctx.GetUserID[string](c)
	if skill.CreatedBy != userID {
		return errors.New("forbidden: you do not have access to this skill")
	}
	return nil
}

type runAgentToolRequest struct {
	PromptID string `json:"prompt_id"`
	Name     string `json:"name"`
	SkillID  string `json:"skill_id"`
	Message  string `json:"message" binding:"required"`
}

// RunAgentToolAPI runs an agent using a prompt ID or name
func RunAgentToolAPI(c *gin.Context) {
	var reqBody runAgentToolRequest
	if err := c.ShouldBindJSON(&reqBody); err != nil {
		gx.JSONErr(c, gx.BErr(err))
		return
	}

	if reqBody.PromptID == "" && reqBody.Name == "" {
		gx.JSONErr(c, gx.BErr(errors.New("either prompt_id or name is required")))
		return
	}
	if reqBody.Name != "" && reqBody.SkillID == "" {
		gx.JSONErr(c, gx.BErr(errors.New("skill_id is required when using name")))
		return
	}

	// Fetch prompt to get config
	promptReq := &appdto.GetPromptReq{
		ID:      reqBody.PromptID,
		Name:    reqBody.Name,
		SkillID: reqBody.SkillID,
	}
	prompt, err := di.PromptApp.GetPrompt(c, promptReq)
	if err != nil {
		gx.JSONErr(c, err)
		return
	}

	// Check access
	if err := checkSkillAccess(c, prompt.SkillID); err != nil {
		gx.JSONErr(c, gx.BErr(err))
		return
	}

	// Create session
	sessionID := uuid.New().String()

	// Prepare HTTP request wrapper for cortex
	httpHandler := http.NewHandler()
	req, err := httpHandler.GetMessageRequest(c)
	if err != nil {
		gx.JSONErr(c, err)
		return
	}
	req.SessionID = sessionID
	req.Message = reqBody.Message

	// Initialize engine
	engine, err := di.AgentApp.Engine(sessionID, prompt.Content, prompt.Config)
	if err != nil {
		gx.JSONErr(c, err)
		return
	}

	// Use bodyLogWriter to intercept and format response if needed
	// Here we reuse the same logic as AgentChatAPI to ensure consistency
	blw := &bodyLogWriter{body: bytes.NewBufferString(""), ResponseWriter: c.Writer, sessionID: sessionID}
	c.Writer = blw

	httpHandler.ChatAPI(c, engine, req)
}

// GetPromptListToolAPI lists prompts (mirroring MCP list_prompts)
func GetPromptListToolAPI(c *gin.Context) {
	skillID := c.Query("skill_id")
	status := c.Query("status")
	name := c.Query("name")

	if skillID == "" {
		userRole := cctx.GetUserRole[string](c)
		if userRole != "admin" {
			gx.JSONErr(c, gx.BErr(errors.New("skill_id is required for non-admin users")))
			return
		}
	} else {
		if err := checkSkillAccess(c, skillID); err != nil {
			gx.JSONErr(c, gx.BErr(err))
			return
		}
	}

	prompts, err := di.PromptApp.GetPromptList(c, skillID, name, status)
	if err != nil {
		gx.JSONErr(c, err)
		return
	}
	gx.JSONSuccess(c, prompts)
}

// GetPromptToolAPI gets a prompt (mirroring MCP get_prompt)
func GetPromptToolAPI(c *gin.Context) {
	id := c.Query("id")
	name := c.Query("name")
	skillID := c.Query("skill_id")

	if id == "" && name == "" {
		gx.JSONErr(c, gx.BErr(errors.New("either id or name is required")))
		return
	}
	if name != "" && skillID == "" {
		gx.JSONErr(c, gx.BErr(errors.New("skill_id is required when using name")))
		return
	}

	req := &appdto.GetPromptReq{
		ID:      id,
		Name:    name,
		SkillID: skillID,
	}
	prompt, err := di.PromptApp.GetPrompt(c, req)
	if err != nil {
		gx.JSONErr(c, err)
		return
	}

	// Check access
	if err := checkSkillAccess(c, prompt.SkillID); err != nil {
		gx.JSONErr(c, gx.BErr(err))
		return
	}

	gx.JSONSuccess(c, prompt)
}

// ListSkillFilesToolAPI lists skill files (mirroring MCP list_skill_files)
func ListSkillFilesToolAPI(c *gin.Context) {
	skillID := c.Query("skill_id")
	if skillID == "" {
		gx.JSONErr(c, gx.BErr(errors.New("skill_id is required")))
		return
	}

	if err := checkSkillAccess(c, skillID); err != nil {
		gx.JSONErr(c, gx.BErr(err))
		return
	}

	files, err := di.SkillFileApp.GetSkillFileList(c, skillID)
	if err != nil {
		gx.JSONErr(c, err)
		return
	}
	gx.JSONSuccess(c, files)
}

// GetSkillFileToolAPI gets a skill file (mirroring MCP get_skill_file)
func GetSkillFileToolAPI(c *gin.Context) {
	fileID := c.Query("file_id")
	name := c.Query("name")
	skillID := c.Query("skill_id")

	if fileID == "" && name == "" {
		gx.JSONErr(c, gx.BErr(errors.New("either file_id or name is required")))
		return
	}
	if name != "" && skillID == "" {
		gx.JSONErr(c, gx.BErr(errors.New("skill_id is required when using name")))
		return
	}

	req := &appdto.GetSkillFileReq{
		ID:      fileID,
		Name:    name,
		SkillID: skillID,
	}
	file, err := di.SkillFileApp.GetSkillFile(c, req)
	if err != nil {
		gx.JSONErr(c, err)
		return
	}

	// Check access
	if err := checkSkillAccess(c, file.SkillID); err != nil {
		gx.JSONErr(c, gx.BErr(err))
		return
	}

	gx.JSONSuccess(c, file)
}
