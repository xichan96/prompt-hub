package model

import (
	"time"

	"github.com/xichan96/prompt-hub/pkg/sql"
	"gorm.io/gen/field"
)

const TableUser = "user"

var UserFM = sql.NewGlobalFieldMetaMapping(User{}, UserFieldMeta{})

type User struct {
	ID        string    `json:"id" gorm:"column:id;type:varchar(36);primaryKey;comment:id"`
	Username  string    `json:"username" gorm:"column:username;type:varchar(255);not null;comment:username"`
	Password  string    `json:"password" gorm:"column:password;type:varchar(255);not null;comment:password"`
	Role      string    `json:"role" gorm:"column:role;type:varchar(36);not null;comment:role"` // admin, user
	CreatedAt time.Time `json:"created_at" gorm:"column:created_at;type:datetime;not null;default:CURRENT_TIMESTAMP"`
	UpdatedAt time.Time `json:"updated_at" gorm:"column:updated_at;type:datetime;not null;default:CURRENT_TIMESTAMP"`
}

func (User) TableName() string {
	return TableUser
}

type UserFieldMeta struct {
	sql.CTable
	ALL       field.Asterisk
	ID        field.String
	Username  field.String
	Password  field.String
	Role      field.String
	CreatedAt field.Time
	UpdatedAt field.Time
}
