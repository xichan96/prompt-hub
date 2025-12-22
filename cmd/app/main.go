package main

import (
	"github.com/xichan96/prompt-hub/cmd/app/router"
	"github.com/xichan96/prompt-hub/internal/config"
	"github.com/xichan96/prompt-hub/internal/infra/migrate"
	"github.com/xichan96/prompt-hub/pkg/web/gx"
)

func main() {
	config.InitConfig()
	if err := migrate.EnsureDatabase(); err != nil {
		panic(err)
	}
	config.InitVariable()
	migrate.MigrateTable()
	s := gx.NewServer()
	router.RegisterAPIRouter(s.Engine)
	s.Run()
}
