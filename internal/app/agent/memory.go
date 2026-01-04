package agent

import (
	"github.com/xichan96/cortex/agent/providers"
	"github.com/xichan96/cortex/agent/types"
)

func (a *app) setupMemory(sessionID string) types.MemoryProvider {
	return providers.NewSimpleMemoryProviderWithLimit(100)
}
