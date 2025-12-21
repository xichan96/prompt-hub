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

}
