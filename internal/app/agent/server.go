package agent

import (
	"context"
	"fmt"

	"github.com/xichan96/cortex/agent/engine"
	"github.com/xichan96/cortex/agent/types"
	"github.com/xichan96/prompt-hub/internal/app/setting"
)

type AppIer interface {
	build(sessionID string) (*engine.AgentEngine, error)
	Engine(sessionID string) (*engine.AgentEngine, error)
}

type app struct {
	settingSrv setting.AppIer
}

func NewApp(settingSrv setting.AppIer) AppIer {
	return &app{
		settingSrv: settingSrv,
	}
}

func (a *app) build(sessionID string) (*engine.AgentEngine, error) {
	llmProvider, err := a.setupLLM()
	if err != nil {
		return nil, fmt.Errorf("failed to setup LLM: %w", err)
	}
	if llmProvider == nil {
		return nil, fmt.Errorf("LLM provider is nil")
	}

	memoryProvider := a.setupMemory(sessionID)

	agentConfig := a.setupAgentConfig()

	engine := engine.NewAgentEngine(llmProvider, agentConfig)
	engine.SetMemory(memoryProvider)
	return engine, nil
}
func (a *app) Engine(sessionID string) (*engine.AgentEngine, error) {
	return a.build(sessionID)
}

func (a *app) setupAgentConfig() *types.AgentConfig {
	agentConfig := types.NewAgentConfig()

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
