package model

import (
	"time"

	"github.com/xichan96/prompt-hub/pkg/sql"
	"gorm.io/gen/field"
)

const TableSkillFile = "skill_file"

var SkillFileFM = sql.NewGlobalFieldMetaMapping(SkillFile{}, SkillFileFieldMeta{})

type SkillFile struct {
	ID          string    `json:"id" gorm:"column:id;type:varchar(36);primaryKey;comment:id"`
	SkillID     string    `json:"skill_id" gorm:"column:skill_id;type:varchar(36);not null;comment:skill_id"`
	Name        string    `json:"name" gorm:"column:name;type:varchar(255);not null;comment:name (file path)"`
	Description string    `json:"description" gorm:"column:description;type:text;comment:description"`
	Content     string    `json:"content" gorm:"column:content;type:text;not null;comment:content"`
	CreatedBy   string    `json:"created_by" gorm:"column:created_by;type:varchar(36);not null;comment:created_by"`
	CreatedAt   time.Time `json:"created_at" gorm:"column:created_at;type:datetime;not null;default:CURRENT_TIMESTAMP"`
	UpdatedAt   time.Time `json:"updated_at" gorm:"column:updated_at;type:datetime;not null;default:CURRENT_TIMESTAMP"`
}

func (SkillFile) TableName() string {
	return TableSkillFile
}

type SkillFileFieldMeta struct {
	sql.CTable
	ALL         field.Asterisk
	ID          field.String
	SkillID     field.String
	Name        field.String
	Description field.String
	Content     field.String
	CreatedBy   field.String
	CreatedAt   field.Time
	UpdatedAt   field.Time
}
