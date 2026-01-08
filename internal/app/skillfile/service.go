package skillfile

import (
	"context"
	"errors"
	"time"

	"github.com/xichan96/prompt-hub/internal/appdto"
	"github.com/xichan96/prompt-hub/internal/infra/model"
	"github.com/xichan96/prompt-hub/internal/infra/persist"
	"github.com/xichan96/prompt-hub/pkg/web/cctx"
	"gorm.io/gorm"
)

type AppIer interface {
	CreateSkillFile(ctx context.Context, req *appdto.CreateSkillFileReq) (string, error)
	UpdateSkillFile(ctx context.Context, req *appdto.UpdateSkillFileReq) error
	DeleteSkillFile(ctx context.Context, req *appdto.DeleteSkillFileReq) error
	GetSkillFile(ctx context.Context, req *appdto.GetSkillFileReq) (*appdto.SkillFile, error)
	GetSkillFileList(ctx context.Context, skillID string) ([]*appdto.SkillFile, error)
}

type app struct {
	p persist.SkillFilePersistIer
}

func NewApp(p persist.SkillFilePersistIer) AppIer {
	return &app{
		p: p,
	}
}

func (a *app) CreateSkillFile(ctx context.Context, req *appdto.CreateSkillFileReq) (string, error) {
	// Check existence
	options := make([]func(*gorm.DB) *gorm.DB, 0)
	options = append(options, a.p.Where(a.p.F().SkillID.Eq(req.SkillID), a.p.F().Name.Eq(req.Name)))
	if _, err := a.p.GetBy(ctx, options...); err == nil {
		return "", errors.New("file already exists")
	}

	nowTime := time.Now()
	file := &model.SkillFile{
		SkillID:     req.SkillID,
		Name:        req.Name,
		Description: req.Description,
		Content:     req.Content,
		CreatedBy:   cctx.GetUserID[string](ctx),
		CreatedAt:   nowTime,
		UpdatedAt:   nowTime,
	}
	return a.p.Create(ctx, file)
}

func (a *app) UpdateSkillFile(ctx context.Context, req *appdto.UpdateSkillFileReq) error {
	file, err := a.p.GetByID(ctx, req.ID)
	if err != nil {
		return errors.New("file not found")
	}

	if req.Description != "" {
		file.Description = req.Description
	}
	if req.Content != "" {
		file.Content = req.Content
	}
	file.UpdatedAt = time.Now()
	return a.p.Update(ctx, file)
}

func (a *app) DeleteSkillFile(ctx context.Context, req *appdto.DeleteSkillFileReq) error {
	options := make([]func(*gorm.DB) *gorm.DB, 0)
	if req.ID != "" {
		options = append(options, a.p.Where(a.p.F().ID.Eq(req.ID)))
	} else {
		options = append(options, a.p.Where(a.p.F().SkillID.Eq(req.SkillID)))
	}
	return a.p.DeleteBatch(ctx, options...)
}

func (a *app) GetSkillFile(ctx context.Context, req *appdto.GetSkillFileReq) (*appdto.SkillFile, error) {
	var file *model.SkillFile
	var err error

	if req.ID != "" {
		file, err = a.p.GetByID(ctx, req.ID)
	} else {
		options := make([]func(*gorm.DB) *gorm.DB, 0)
		options = append(options, a.p.Where(a.p.F().SkillID.Eq(req.SkillID), a.p.F().Name.Eq(req.Name)))
		file, err = a.p.GetBy(ctx, options...)
	}

	if err != nil {
		return nil, errors.New("file not found")
	}
	return toAppDTO(file), nil
}

func (a *app) GetSkillFileList(ctx context.Context, skillID string) ([]*appdto.SkillFile, error) {
	options := make([]func(*gorm.DB) *gorm.DB, 0)
	options = append(options, a.p.Where(a.p.F().SkillID.Eq(skillID)))
	options = append(options, func(db *gorm.DB) *gorm.DB {
		return db.Order("updated_at DESC")
	})

	files, err := a.p.GetList(ctx, options...)
	if err != nil {
		return nil, err
	}

	result := make([]*appdto.SkillFile, 0, len(files))
	for _, f := range files {
		result = append(result, toAppDTO(f))
	}
	return result, nil
}

func toAppDTO(f *model.SkillFile) *appdto.SkillFile {
	return &appdto.SkillFile{
		ID:          f.ID,
		SkillID:     f.SkillID,
		Name:        f.Name,
		Description: f.Description,
		Content:     f.Content,
		CreatedBy:   f.CreatedBy,
		CreatedAt:   f.CreatedAt,
		UpdatedAt:   f.UpdatedAt,
	}
}
