package model

import (
	"time"

	"github.com/xichan96/prompt-hub/pkg/sql"
	"gorm.io/gen/field"
)

const TableNamespace = "namespace"

var NamespaceFM = sql.NewGlobalFieldMetaMapping(Namespace{}, NamespaceFieldMeta{})

type Namespace struct {
	ID          string    `json:"id" gorm:"column:id;type:varchar(36);primaryKey;comment:id"`
	Name        string    `json:"name" gorm:"column:name;type:varchar(255);not null;comment:name"`
	Description string    `json:"description" gorm:"column:description;type:text;not null;comment:description"`
	CreatedBy   string    `json:"created_by" gorm:"column:created_by;type:varchar(36);not null;comment:created_by"`
	CreatedAt   time.Time `json:"created_at" gorm:"column:created_at;type:datetime;not null;default:CURRENT_TIMESTAMP"`
	UpdatedAt   time.Time `json:"updated_at" gorm:"column:updated_at;type:datetime;not null;default:CURRENT_TIMESTAMP"`
}

func (Namespace) TableName() string {
	return TableNamespace
}

type NamespaceFieldMeta struct {
	sql.CTable
	ALL         field.Asterisk
	ID          field.String
	Name        field.String
	Description field.String
	CreatedBy   field.String
	CreatedAt   field.Time
	UpdatedAt   field.Time
}
