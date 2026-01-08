package config

import (
	"os"
	"strconv"

	"github.com/xichan96/prompt-hub/pkg/sql/mysql"
)

var Env = os.Getenv("CONFIG_ENV")

var Config = &config{}

type config struct {
	Mysql *mysql.Config `json:"mysql"`
}

func InitConfig() {
	portStr := getEnv("DB_PORT", "3306")
	port, err := strconv.Atoi(portStr)
	if err != nil {
		port = 3306
	}

	Config.Mysql = &mysql.Config{
		Host:     getEnv("DB_HOST", "127.0.0.1"),
		Port:     port,
		User:     getEnv("DB_USER", "root"),
		Password: getEnv("DB_PASSWORD", "test@123"),
		Database: getEnv("DB_NAME", "prompt_hub"),
	}
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}
