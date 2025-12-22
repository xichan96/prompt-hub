package config

import (
	"os"

	"github.com/xichan96/prompt-hub/pkg/sql/mysql"
)

var Env = os.Getenv("CONFIG_ENV")

var Config = &config{}

type config struct {
	Mysql *mysql.Config `json:"mysql"`
}

func InitConfig() {
	Config.Mysql = &mysql.Config{
		Host:     "127.0.0.1",
		Port:     3306,
		User:     "root",
		Password: "test@123",
		Database: "prompt_hub",
	}
}
