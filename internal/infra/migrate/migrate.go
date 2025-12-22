package migrate

import (
	"fmt"

	gmysql "gorm.io/driver/mysql"
	"gorm.io/gorm"

	"github.com/xichan96/prompt-hub/internal/config"
	"github.com/xichan96/prompt-hub/internal/infra/model"
)

func EnsureDatabase() error {
	cfg := config.Config.Mysql
	dsn := fmt.Sprintf("%s:%s@(%s:%d)/?charset=utf8mb4&parseTime=True&loc=Local", cfg.User, cfg.Password, cfg.Host, cfg.Port)
	db, err := gorm.Open(gmysql.Open(dsn), &gorm.Config{})
	if err != nil {
		return err
	}
	defer func() {
		sqlDB, _ := db.DB()
		if sqlDB != nil {
			sqlDB.Close()
		}
	}()

	var count int64
	err = db.Raw("SELECT COUNT(*) FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = ?", cfg.Database).Scan(&count).Error
	if err != nil {
		return err
	}

	if count == 0 {
		createSQL := fmt.Sprintf("CREATE DATABASE `%s` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci", cfg.Database)
		if err = db.Exec(createSQL).Error; err != nil {
			return err
		}
	}

	return nil
}

func MigrateTable() {
	config.Var.Mysql.DB.AutoMigrate(
		&model.Prompt{},
		&model.Setting{},
		&model.User{},
		&model.Namespace{},
	)
}

func Run() {
	if err := EnsureDatabase(); err != nil {
		panic(err)
	}
	MigrateTable()
}
