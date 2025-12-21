package persist

import (
	"context"

	"github.com/xichan96/prompt-hub/internal/infra/model"
	"github.com/xichan96/prompt-hub/pkg/sql"
	"github.com/xichan96/prompt-hub/pkg/std/snowflake"
	"gorm.io/gorm"
)

type PromptPersistIer interface {
	sql.Corm

	Field() *model.PromptFieldMeta
	F() *model.PromptFieldMeta

	Create(ctx context.Context, prompt *model.Prompt) (string, error)
	CreateBatch(ctx context.Context, prompts []*model.Prompt) error
	Update(ctx context.Context, prompt *model.Prompt, options ...func(*gorm.DB) *gorm.DB) error
	Get(ctx context.Context, data any, options ...func(*gorm.DB) *gorm.DB) error
	Gets(ctx context.Context, data any, options ...func(*gorm.DB) *gorm.DB) error
	GetBy(ctx context.Context, options ...func(*gorm.DB) *gorm.DB) (*model.Prompt, error)
	GetByID(ctx context.Context, id string) (*model.Prompt, error)
	GetList(ctx context.Context, options ...func(*gorm.DB) *gorm.DB) ([]*model.Prompt, error)
	Count(ctx context.Context, option ...func(db *gorm.DB) *gorm.DB) (int64, error)
	Delete(ctx context.Context, prompt *model.Prompt) error
	DeleteBatch(ctx context.Context, options ...func(*gorm.DB) *gorm.DB) error
}

func NewPromptPersist() PromptPersistIer {
	cp := &PromptPersist{
		PromptFieldMeta: model.PromptFM,
	}
	return cp
}

type PromptPersist struct {
	*model.PromptFieldMeta
	sql.BaseOpr
}

func (p *PromptPersist) Field() *model.PromptFieldMeta {
	return p.PromptFieldMeta
}

func (p *PromptPersist) F() *model.PromptFieldMeta {
	return p.PromptFieldMeta
}

func (p *PromptPersist) Create(ctx context.Context, prompt *model.Prompt) (string, error) {
	if len(prompt.ID) == 0 {
		prompt.ID = snowflake.NewUUID()
	}

	if err := p.DB(ctx).Table(p.Table()).Create(&prompt).Error; err != nil {
		return "", err
	}
	return prompt.ID, nil
}

func (p *PromptPersist) CreateBatch(ctx context.Context, prompts []*model.Prompt) error {
	for _, prompt := range prompts {
		if len(prompt.ID) == 0 {
			prompt.ID = snowflake.NewUUID()
		}
	}

	if err := p.DB(ctx).Table(p.Table()).CreateInBatches(&prompts, 100).Error; err != nil {
		return err
	}
	return nil
}

func (p *PromptPersist) Update(ctx context.Context, prompt *model.Prompt, options ...func(*gorm.DB) *gorm.DB) error {
	query := p.DB(ctx).Table(p.Table()).Scopes(options...).Updates(prompt)
	if err := query.Error; err != nil {
		return err
	}
	return nil
}

func (p *PromptPersist) Get(ctx context.Context, data any, options ...func(*gorm.DB) *gorm.DB) error {
	query := p.DB(ctx).Table(p.Table()).Scopes(options...)
	if err := query.Take(data).Error; err != nil {
		return err
	}
	return nil
}

func (p *PromptPersist) Gets(ctx context.Context, data any, options ...func(*gorm.DB) *gorm.DB) error {
	query := p.DB(ctx).Table(p.Table()).Scopes(options...)
	if err := query.Find(data).Error; err != nil {
		return err
	}
	return nil
}

func (p *PromptPersist) GetBy(ctx context.Context, options ...func(*gorm.DB) *gorm.DB) (*model.Prompt, error) {
	var prompt model.Prompt
	query := p.DB(ctx).Table(p.Table()).Scopes(options...)
	if err := query.Take(&prompt).Error; err != nil {
		return nil, err
	}
	return &prompt, nil
}

func (p *PromptPersist) GetByID(ctx context.Context, id string) (*model.Prompt, error) {
	var prompt model.Prompt
	query := p.DB(ctx).Table(p.Table()).Where(p.ID.Eq(id))
	if err := query.Take(&prompt).Error; err != nil {
		return nil, err
	}
	return &prompt, nil
}

func (p *PromptPersist) GetList(ctx context.Context, options ...func(*gorm.DB) *gorm.DB) ([]*model.Prompt, error) {
	var prompts []*model.Prompt
	query := p.DB(ctx).Table(p.Table()).Scopes(options...)
	if err := query.Find(&prompts).Error; err != nil {
		return nil, err
	}
	return prompts, nil
}

func (p *PromptPersist) Delete(ctx context.Context, prompt *model.Prompt) error {
	if err := p.DB(ctx).Table(p.Table()).Where(p.ID.Eq(prompt.ID)).Delete(nil).Error; err != nil {
		return err
	}
	return nil
}

func (p *PromptPersist) DeleteBatch(ctx context.Context, options ...func(*gorm.DB) *gorm.DB) error {
	if err := p.DB(ctx).Table(p.Table()).Scopes(options...).Delete(nil).Error; err != nil {
		return err
	}
	return nil
}

func (p *PromptPersist) Count(ctx context.Context, option ...func(db *gorm.DB) *gorm.DB) (int64, error) {
	var count int64
	if err := p.DB(ctx).Table(p.Table()).Scopes(option...).Count(&count).Error; err != nil {
		return 0, err
	}
	return count, nil
}
