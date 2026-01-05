//go:build wireinject
// +build wireinject

package di

import (
	"github.com/google/wire"
	"github.com/xichan96/prompt-hub/internal/app/agent"
	"github.com/xichan96/prompt-hub/internal/app/namespace"
	"github.com/xichan96/prompt-hub/internal/app/prompt"
	"github.com/xichan96/prompt-hub/internal/app/setting"
	"github.com/xichan96/prompt-hub/internal/app/user"
	"github.com/xichan96/prompt-hub/internal/infra/persist"
)

var PromptApp = NewPromptApp()

func NewPromptApp() prompt.AppIer {
	panic(wire.Build(
		persist.NewPromptPersist,
		prompt.NewApp,
	))
}

var UserApp = NewUserApp()

func NewUserApp() user.AppIer {
	panic(wire.Build(
		persist.NewUserPersist,
		user.NewApp,
	))
}

var NamespaceApp = NewNamespaceApp()

func NewNamespaceApp() namespace.AppIer {
	panic(wire.Build(
		persist.NewNamespacePersist,
		namespace.NewApp,
	))
}

var SettingApp = NewSettingApp()

func NewSettingApp() setting.AppIer {
	panic(wire.Build(
		persist.NewSettingPersist,
		setting.NewApp,
	))
}

var AgentApp = NewAgentApp()

func NewAgentApp() agent.AppIer {
	panic(wire.Build(
		persist.NewSettingPersist,
		setting.NewApp,
		agent.NewApp,
	))
}
