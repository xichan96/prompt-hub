package agent

import (
	"context"
	"fmt"
	"log/slog"

	"github.com/goccy/go-yaml"
	"github.com/xichan96/cortex/agent/engine"
	"github.com/xichan96/cortex/agent/types"
	"github.com/xichan96/prompt-hub/internal/app/setting"
)

type AppIer interface {
	build(sessionID string, promptContent string, promptConfig string) (*engine.AgentEngine, error)
	Engine(sessionID string, promptContent string, promptConfig string) (*engine.AgentEngine, error)
}

type app struct {
	settingSrv setting.AppIer
}

func NewApp(settingSrv setting.AppIer) AppIer {
	return &app{
		settingSrv: settingSrv,
	}
}

type PromptConfig struct {
	Model struct {
		Name        string  `yaml:"name"`
		Temperature float64 `yaml:"temperature"`
	} `yaml:"model"`
	Parameters struct {
		MaxTokens int `yaml:"max_tokens"`
	} `yaml:"parameters"`
}

func (a *app) build(sessionID string, promptContent string, promptConfigStr string) (*engine.AgentEngine, error) {
	var promptConfig *PromptConfig
	if promptConfigStr != "" {
		promptConfig = &PromptConfig{}
		if err := yaml.Unmarshal([]byte(promptConfigStr), promptConfig); err != nil {
			slog.Warn("failed to parse prompt config", "error", err)
			promptConfig = nil
		}
	}

	llmProvider, err := a.setupLLM(promptConfig)
	if err != nil {
		return nil, fmt.Errorf("failed to setup LLM: %w", err)
	}
	if llmProvider == nil {
		return nil, fmt.Errorf("LLM provider is nil")
	}

	memoryProvider := a.setupMemory(sessionID)

	agentConfig := a.setupAgentConfig(promptContent)

	engine := engine.NewAgentEngine(llmProvider, agentConfig)
	engine.SetMemory(memoryProvider)
	return engine, nil
}
func (a *app) Engine(sessionID string, promptContent string, promptConfig string) (*engine.AgentEngine, error) {
	return a.build(sessionID, promptContent, promptConfig)
}

func (a *app) setupAgentConfig(promptContent string) *types.AgentConfig {
	agentConfig := types.NewAgentConfig()

	if promptContent != "" {
		agentConfig.SystemMessage = promptContent
		return agentConfig
	}

	agentSetting, err := a.settingSrv.GetAgentSetting(context.Background())
	if err != nil || agentSetting == nil || agentSetting.AgentConfig == nil {
		return agentConfig
	}

	cfg := agentSetting.AgentConfig
	if cfg.Prompt != "" {
		agentConfig.SystemMessage = cfg.Prompt
	}

	return agentConfig
}
