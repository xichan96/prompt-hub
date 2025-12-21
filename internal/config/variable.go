package config

import (
	"github.com/xichan96/prompt-hub/pkg/log"
	"github.com/xichan96/prompt-hub/pkg/sql"
	"github.com/xichan96/prompt-hub/pkg/sql/mysql"
	"gorm.io/gorm"
)

var Var = variable{}

type variable struct {
	Mysql *mysql.Client
}

func InitVariable() {
	var err error
	Var.Mysql, err = mysql.NewClient(Config.Mysql)
	if err != nil {
		log.Fatal(err)
	}
	sql.SetDefaultDB(func() *gorm.DB {
		return Var.Mysql.DB
	})
}
