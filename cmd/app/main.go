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
	"context"

	"github.com/xichan96/prompt-hub/cmd/app/router"
	"github.com/xichan96/prompt-hub/internal/config"
	"github.com/xichan96/prompt-hub/internal/infra/migrate"
	"github.com/xichan96/prompt-hub/internal/infra/model"
	"github.com/xichan96/prompt-hub/internal/infra/persist"
	"github.com/xichan96/prompt-hub/pkg/ec"
	"github.com/xichan96/prompt-hub/pkg/log"
	"github.com/xichan96/prompt-hub/pkg/web/gx"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	config.InitConfig()
	if err := migrate.EnsureDatabase(); err != nil {
		panic(err)
	}
	config.InitVariable()
	migrate.MigrateTable()
	initAdminUser()
	s := gx.NewServer()
	router.RegisterAPIRouter(s.Engine)
	s.Run()
}

func initAdminUser() {
	ctx := context.Background()
	up := persist.NewUserPersist()

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte("adminadmin"), bcrypt.DefaultCost)
	if err != nil {
		log.Fatal(err)
	}

	user, err := up.GetBy(ctx, up.Where(
		up.F().Username.Eq("admin"),
	))

	if err != nil && ec.IsErrCode(err, ec.NoFound) {
		_, err = up.Create(ctx, &model.User{
			Username: "admin",
			Password: string(hashedPassword),
			Role:     "admin",
		})
		if err != nil {
			log.Fatal(err)
		}
		log.Info("Admin user initialized")
	} else if err != nil {
		log.Fatal(err)
	} else {
		user.Password = string(hashedPassword)
		user.Role = "admin"
		if err := up.Update(ctx, user); err != nil {
			log.Fatal(err)
		}
		log.Info("Admin user password updated")
	}
}
