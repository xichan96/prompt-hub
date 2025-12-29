// @title           Prompt Hub API
// @version         1.0
// @description     Prompt Hub API 文档
// @termsOfService  http://swagger.io/terms/

// @contact.name   API Support
// @contact.url    http://www.swagger.io/support
// @contact.email  support@swagger.io

// @license.name  Apache 2.0
// @license.url   http://www.apache.org/licenses/LICENSE-2.0.html

// @host      localhost:8088
// @BasePath  /api

// @schemes   http https
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
