package persist

import (
	"context"

	"github.com/xichan96/prompt-hub/internal/infra/model"
	"github.com/xichan96/prompt-hub/pkg/sql"
	"github.com/xichan96/prompt-hub/pkg/std/snowflake"
	"gorm.io/gorm"
)

type SkillFilePersistIer interface {
	sql.Corm

	Field() *model.SkillFileFieldMeta
	F() *model.SkillFileFieldMeta

	Create(ctx context.Context, file *model.SkillFile) (string, error)
	CreateBatch(ctx context.Context, files []*model.SkillFile) error
	Update(ctx context.Context, file *model.SkillFile, options ...func(*gorm.DB) *gorm.DB) error
	Get(ctx context.Context, data any, options ...func(*gorm.DB) *gorm.DB) error
	Gets(ctx context.Context, data any, options ...func(*gorm.DB) *gorm.DB) error
	GetBy(ctx context.Context, options ...func(*gorm.DB) *gorm.DB) (*model.SkillFile, error)
	GetByID(ctx context.Context, id string) (*model.SkillFile, error)
	GetList(ctx context.Context, options ...func(*gorm.DB) *gorm.DB) ([]*model.SkillFile, error)
	Count(ctx context.Context, option ...func(db *gorm.DB) *gorm.DB) (int64, error)
	Delete(ctx context.Context, file *model.SkillFile) error
	DeleteBatch(ctx context.Context, options ...func(*gorm.DB) *gorm.DB) error
}

func NewSkillFilePersist() SkillFilePersistIer {
	return &SkillFilePersist{
		SkillFileFieldMeta: model.SkillFileFM,
	}
}

type SkillFilePersist struct {
	*model.SkillFileFieldMeta
	sql.BaseOpr
}

func (p *SkillFilePersist) Field() *model.SkillFileFieldMeta {
	return p.SkillFileFieldMeta
}

func (p *SkillFilePersist) F() *model.SkillFileFieldMeta {
	return p.SkillFileFieldMeta
}

func (p *SkillFilePersist) Create(ctx context.Context, file *model.SkillFile) (string, error) {
	if len(file.ID) == 0 {
		file.ID = snowflake.NewUUID()
	}

	if err := p.DB(ctx).Table(p.Table()).Create(&file).Error; err != nil {
		return "", err
	}
	return file.ID, nil
}

func (p *SkillFilePersist) CreateBatch(ctx context.Context, files []*model.SkillFile) error {
	for _, file := range files {
		if len(file.ID) == 0 {
			file.ID = snowflake.NewUUID()
		}
	}

	if err := p.DB(ctx).Table(p.Table()).CreateInBatches(&files, 100).Error; err != nil {
		return err
	}
	return nil
}

func (p *SkillFilePersist) Update(ctx context.Context, file *model.SkillFile, options ...func(*gorm.DB) *gorm.DB) error {
	query := p.DB(ctx).Table(p.Table()).Scopes(options...).Updates(file)
	if err := query.Error; err != nil {
		return err
	}
	return nil
}

func (p *SkillFilePersist) Get(ctx context.Context, data any, options ...func(*gorm.DB) *gorm.DB) error {
	query := p.DB(ctx).Table(p.Table()).Scopes(options...)
	if err := query.Take(data).Error; err != nil {
		return err
	}
	return nil
}

func (p *SkillFilePersist) Gets(ctx context.Context, data any, options ...func(*gorm.DB) *gorm.DB) error {
	query := p.DB(ctx).Table(p.Table()).Scopes(options...)
	if err := query.Find(data).Error; err != nil {
		return err
	}
	return nil
}

func (p *SkillFilePersist) GetBy(ctx context.Context, options ...func(*gorm.DB) *gorm.DB) (*model.SkillFile, error) {
	var file model.SkillFile
	query := p.DB(ctx).Table(p.Table()).Scopes(options...)
	if err := query.Take(&file).Error; err != nil {
		return nil, err
	}
	return &file, nil
}

func (p *SkillFilePersist) GetByID(ctx context.Context, id string) (*model.SkillFile, error) {
	var file model.SkillFile
	query := p.DB(ctx).Table(p.Table()).Where(p.ID.Eq(id))
	if err := query.Take(&file).Error; err != nil {
		return nil, err
	}
	return &file, nil
}

func (p *SkillFilePersist) GetList(ctx context.Context, options ...func(*gorm.DB) *gorm.DB) ([]*model.SkillFile, error) {
	var files []*model.SkillFile
	query := p.DB(ctx).Table(p.Table()).Scopes(options...)
	if err := query.Find(&files).Error; err != nil {
		return nil, err
	}
	return files, nil
}

func (p *SkillFilePersist) Delete(ctx context.Context, file *model.SkillFile) error {
	if err := p.DB(ctx).Table(p.Table()).Where(p.ID.Eq(file.ID)).Delete(nil).Error; err != nil {
		return err
	}
	return nil
}

func (p *SkillFilePersist) DeleteBatch(ctx context.Context, options ...func(*gorm.DB) *gorm.DB) error {
	if err := p.DB(ctx).Table(p.Table()).Scopes(options...).Delete(nil).Error; err != nil {
		return err
	}
	return nil
}

func (p *SkillFilePersist) Count(ctx context.Context, option ...func(db *gorm.DB) *gorm.DB) (int64, error) {
	var count int64
	if err := p.DB(ctx).Table(p.Table()).Scopes(option...).Count(&count).Error; err != nil {
		return 0, err
	}
	return count, nil
}
