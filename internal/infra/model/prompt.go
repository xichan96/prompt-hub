package model

import (
	"time"

	"github.com/xichan96/prompt-hub/pkg/sql"
	"gorm.io/gen/field"
)

const TablePrompt = "prompt"

var PromptFM = sql.NewGlobalFieldMetaMapping(Prompt{}, PromptFieldMeta{})

type Prompt struct {
	ID          string    `json:"id" gorm:"column:id;type:varchar(36);primaryKey;comment:id"`
	Status      string    `json:"status" gorm:"column:status;type:varchar(36);not null;comment:status"` // draft, published, archived
	NamespaceID string    `json:"namespace_id" gorm:"column:namespace_id;type:varchar(36);not null;comment:namespace_id"`
	Name        string    `json:"name" gorm:"column:name;type:varchar(255);not null;comment:name"`
	Description string    `json:"description" gorm:"column:description;type:text;not null;comment:description"`
	Content     string    `json:"content" gorm:"column:content;type:text;not null;comment:content"`
	CreatedBy   string    `json:"created_by" gorm:"column:created_by;type:varchar(36);not null;comment:created_by"`
	CreatedAt   time.Time `json:"created_at" gorm:"column:created_at;type:datetime;not null;default:CURRENT_TIMESTAMP"`
	UpdatedAt   time.Time `json:"updated_at" gorm:"column:updated_at;type:datetime;not null;default:CURRENT_TIMESTAMP"`
}

func (Prompt) TableName() string {
	return TablePrompt
}

type PromptFieldMeta struct {
	sql.CTable
	ALL         field.Asterisk
	ID          field.String
	Status      field.String
	NamespaceID field.String
	Name        field.String
	Description field.String
	Content     field.String
	CreatedBy   field.String
	CreatedAt   field.Time
	UpdatedAt   field.Time
}
