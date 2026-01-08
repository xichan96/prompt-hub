package persist

import (
	"context"

	"github.com/xichan96/prompt-hub/internal/infra/model"
	"github.com/xichan96/prompt-hub/pkg/sql"
	"github.com/xichan96/prompt-hub/pkg/std/snowflake"
	"gorm.io/gorm"
)

type SkillPersistIer interface {
	sql.Corm

	Field() *model.SkillFieldMeta
	F() *model.SkillFieldMeta

	Create(ctx context.Context, skill *model.Skill) (string, error)
	CreateBatch(ctx context.Context, skills []*model.Skill) error
	Update(ctx context.Context, skill *model.Skill, options ...func(*gorm.DB) *gorm.DB) error
	Get(ctx context.Context, data any, options ...func(*gorm.DB) *gorm.DB) error
	Gets(ctx context.Context, data any, options ...func(*gorm.DB) *gorm.DB) error
	GetBy(ctx context.Context, options ...func(*gorm.DB) *gorm.DB) (*model.Skill, error)
	GetByID(ctx context.Context, id string) (*model.Skill, error)
	GetList(ctx context.Context, options ...func(*gorm.DB) *gorm.DB) ([]*model.Skill, error)
	Count(ctx context.Context, option ...func(db *gorm.DB) *gorm.DB) (int64, error)
	Delete(ctx context.Context, skill *model.Skill) error
	DeleteBatch(ctx context.Context, options ...func(*gorm.DB) *gorm.DB) error
}

func NewSkillPersist() SkillPersistIer {
	cp := &SkillPersist{
		SkillFieldMeta: model.SkillFM,
	}
	return cp
}

type SkillPersist struct {
	*model.SkillFieldMeta
	sql.BaseOpr
}

func (n *SkillPersist) Field() *model.SkillFieldMeta {
	return n.SkillFieldMeta
}

func (n *SkillPersist) F() *model.SkillFieldMeta {
	return n.SkillFieldMeta
}

func (n *SkillPersist) Create(ctx context.Context, skill *model.Skill) (string, error) {
	if len(skill.ID) == 0 {
		skill.ID = snowflake.NewUUID()
	}

	if err := n.DB(ctx).Table(n.Table()).Create(&skill).Error; err != nil {
		return "", err
	}
	return skill.ID, nil
}

func (n *SkillPersist) CreateBatch(ctx context.Context, skills []*model.Skill) error {
	for _, skill := range skills {
		if len(skill.ID) == 0 {
			skill.ID = snowflake.NewUUID()
		}
	}

	if err := n.DB(ctx).Table(n.Table()).CreateInBatches(&skills, 100).Error; err != nil {
		return err
	}
	return nil
}

func (n *SkillPersist) Update(ctx context.Context, skill *model.Skill, options ...func(*gorm.DB) *gorm.DB) error {
	query := n.DB(ctx).Table(n.Table()).Scopes(options...).Updates(skill)
	if err := query.Error; err != nil {
		return err
	}
	return nil
}

func (n *SkillPersist) Get(ctx context.Context, data any, options ...func(*gorm.DB) *gorm.DB) error {
	query := n.DB(ctx).Table(n.Table()).Scopes(options...)
	if err := query.Take(data).Error; err != nil {
		return err
	}
	return nil
}

func (n *SkillPersist) Gets(ctx context.Context, data any, options ...func(*gorm.DB) *gorm.DB) error {
	query := n.DB(ctx).Table(n.Table()).Scopes(options...)
	if err := query.Find(data).Error; err != nil {
		return err
	}
	return nil
}

func (n *SkillPersist) GetBy(ctx context.Context, options ...func(*gorm.DB) *gorm.DB) (*model.Skill, error) {
	var skill model.Skill
	query := n.DB(ctx).Table(n.Table()).Scopes(options...)
	if err := query.Take(&skill).Error; err != nil {
		return nil, err
	}
	return &skill, nil
}

func (n *SkillPersist) GetByID(ctx context.Context, id string) (*model.Skill, error) {
	var skill model.Skill
	query := n.DB(ctx).Table(n.Table()).Where(n.ID.Eq(id))
	if err := query.Take(&skill).Error; err != nil {
		return nil, err
	}
	return &skill, nil
}

func (n *SkillPersist) GetList(ctx context.Context, options ...func(*gorm.DB) *gorm.DB) ([]*model.Skill, error) {
	var skills []*model.Skill
	query := n.DB(ctx).Table(n.Table()).Scopes(options...)
	if err := query.Find(&skills).Error; err != nil {
		return nil, err
	}
	return skills, nil
}

func (n *SkillPersist) Delete(ctx context.Context, skill *model.Skill) error {
	if err := n.DB(ctx).Table(n.Table()).Where(n.ID.Eq(skill.ID)).Delete(nil).Error; err != nil {
		return err
	}
	return nil
}

func (n *SkillPersist) DeleteBatch(ctx context.Context, options ...func(*gorm.DB) *gorm.DB) error {
	if err := n.DB(ctx).Table(n.Table()).Scopes(options...).Delete(nil).Error; err != nil {
		return err
	}
	return nil
}

func (n *SkillPersist) Count(ctx context.Context, option ...func(db *gorm.DB) *gorm.DB) (int64, error) {
	var count int64
	if err := n.DB(ctx).Table(n.Table()).Scopes(option...).Count(&count).Error; err != nil {
		return 0, err
	}
	return count, nil
}
