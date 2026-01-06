package prompt

import (
	"context"
	"errors"
	"strings"
	"time"

	"github.com/xichan96/prompt-hub/internal/appdto"
	"github.com/xichan96/prompt-hub/internal/infra/model"
	"github.com/xichan96/prompt-hub/internal/infra/persist"
	"github.com/xichan96/prompt-hub/pkg/web/cctx"
	"gorm.io/gorm"
)

type AppIer interface {
	CreatePrompt(ctx context.Context, req *appdto.CreatePromptDraftReq) (string, error)
	UpdatePrompt(ctx context.Context, req *appdto.UpdatePromptDraftReq) error
	PublishPrompt(ctx context.Context, req *appdto.PublishPromptReq) error
	DeletePrompt(ctx context.Context, req *appdto.DeletePromptReq) error
	GetPrompt(ctx context.Context, req *appdto.GetPromptReq) (*appdto.Prompt, error)
	GetPromptList(ctx context.Context, namespaceID, name, status string) ([]*appdto.Prompt, error)
}

type app struct {
	pp persist.PromptPersistIer
}

func NewApp(pp persist.PromptPersistIer) AppIer {
	return &app{
		pp: pp,
	}
}

func (a *app) CreatePrompt(ctx context.Context, req *appdto.CreatePromptDraftReq) (string, error) {
	// 查询是否存在
	options := make([]func(*gorm.DB) *gorm.DB, 0)
	options = append(options, a.pp.Where(a.pp.F().NamespaceID.Eq(req.NamespaceID), a.pp.F().Name.Eq(req.Name)))
	if _, err := a.pp.GetBy(ctx, options...); err == nil {
		return "", errors.New("prompt already exists")
	}
	// 如果不存在则插入
	nowTime := time.Now()
	prompt := &model.Prompt{
		NamespaceID: req.NamespaceID,
		Name:        req.Name,
		Description: req.Description,
		Content:     req.Content,
		Status:      appdto.PromptStatusDraft,
		CreatedBy:   cctx.GetUserID[string](ctx),
		CreatedAt:   nowTime,
		UpdatedAt:   nowTime,
	}
	return a.pp.Create(ctx, prompt)
}

func (a *app) UpdatePrompt(ctx context.Context, req *appdto.UpdatePromptDraftReq) error {
	nowTime := time.Now()
	options := make([]func(*gorm.DB) *gorm.DB, 0)
	options = append(options, a.pp.Where(a.pp.F().ID.Eq(req.ID), a.pp.F().Status.Eq(appdto.PromptStatusDraft)))
	prompt, err := a.pp.GetBy(ctx, options...)
	if err != nil {
		return errors.New("prompt not found")
	}
	if prompt.Description != req.Description {
		prompt.Description = req.Description
	}
	if prompt.Content != req.Content {
		prompt.Content = req.Content
	}
	prompt.UpdatedAt = nowTime
	return a.pp.Update(ctx, prompt)
}

func (a *app) PublishPrompt(ctx context.Context, req *appdto.PublishPromptReq) error {
	draftOptions := make([]func(*gorm.DB) *gorm.DB, 0)
	draftOptions = append(draftOptions, a.pp.Where(a.pp.F().ID.Eq(req.ID), a.pp.F().Status.Eq(appdto.PromptStatusDraft)))
	draft, err := a.pp.GetBy(ctx, draftOptions...)
	if err != nil {
		return errors.New("draft not found")
	}

	publishedOptions := make([]func(*gorm.DB) *gorm.DB, 0)
	publishedOptions = append(publishedOptions, a.pp.Where(
		a.pp.F().NamespaceID.Eq(draft.NamespaceID),
		a.pp.F().Name.Eq(draft.Name),
		a.pp.F().Status.Eq(appdto.PromptStatusPublished),
	))
	publishedOptions = append(publishedOptions, func(db *gorm.DB) *gorm.DB {
		return db.Order("updated_at DESC")
	})
	published, err := a.pp.GetBy(ctx, publishedOptions...)
	if err == nil && published != nil {
		published.Status = appdto.PromptStatusArchived
		nowTime := time.Now()
		published.UpdatedAt = nowTime
		if err := a.pp.Update(ctx, published); err != nil {
			return err
		}
	}

	nowTime := time.Now()
	description := draft.Description
	if req.Description != "" {
		description = req.Description
		draft.Description = req.Description
		draft.UpdatedAt = nowTime
		if err := a.pp.Update(ctx, draft); err != nil {
			return err
		}
	}
	newPublished := &model.Prompt{
		NamespaceID: draft.NamespaceID,
		Name:        draft.Name,
		Description: description,
		Content:     draft.Content,
		Status:      appdto.PromptStatusPublished,
		CreatedBy:   draft.CreatedBy,
		CreatedAt:   nowTime,
		UpdatedAt:   nowTime,
	}
	_, err = a.pp.Create(ctx, newPublished)
	return err
}

func (a *app) DeletePrompt(ctx context.Context, req *appdto.DeletePromptReq) error {
	options := make([]func(*gorm.DB) *gorm.DB, 0)
	if req.ID != "" {
		options = append(options, a.pp.Where(a.pp.F().ID.Eq(req.ID)))
	} else {
		options = append(options, a.pp.Where(a.pp.F().NamespaceID.Eq(req.NamespaceID), a.pp.F().Name.Eq(req.Name)))
	}
	return a.pp.DeleteBatch(ctx, options...)
}

func (a *app) GetPrompt(ctx context.Context, req *appdto.GetPromptReq) (*appdto.Prompt, error) {
	var prompt *model.Prompt
	var err error
	if req.ID != "" {
		prompt, err = a.pp.GetByID(ctx, req.ID)
	} else {
		options := make([]func(*gorm.DB) *gorm.DB, 0)
		options = append(options, a.pp.Where(
			a.pp.F().NamespaceID.Eq(req.NamespaceID),
			a.pp.F().Name.Eq(req.Name),
		))
		if req.Status != "" {
			options = append(options, a.pp.Where(a.pp.F().Status.Eq(req.Status)))
		}
		prompt, err = a.pp.GetBy(ctx, options...)
	}
	if err != nil {
		return nil, errors.New("prompt not found")
	}
	return toAppDTO(prompt), nil
}

func (a *app) GetPromptList(ctx context.Context, namespaceID, name, status string) ([]*appdto.Prompt, error) {
	options := make([]func(*gorm.DB) *gorm.DB, 0)
	options = append(options, a.pp.Where(a.pp.F().NamespaceID.Eq(namespaceID)))
	if len(name) > 0 {
		options = append(options, a.pp.Where(a.pp.F().Name.Like("%"+name+"%")))
	}
	if len(status) > 0 {
		statuses := make([]string, 0)
		for _, s := range strings.Split(status, ",") {
			if trimmed := strings.TrimSpace(s); trimmed != "" {
				statuses = append(statuses, trimmed)
			}
		}
		if len(statuses) > 0 {
			options = append(options, a.pp.Where(a.pp.F().Status.In(statuses...)))
		}
	}
	options = append(options, func(db *gorm.DB) *gorm.DB {
		return db.Order("updated_at DESC")
	})
	prompts, err := a.pp.GetList(ctx, options...)
	if err != nil {
		return nil, err
	}
	result := make([]*appdto.Prompt, 0, len(prompts))
	for _, p := range prompts {
		result = append(result, toAppDTO(p))
	}
	return result, nil
}

func toAppDTO(p *model.Prompt) *appdto.Prompt {
	return &appdto.Prompt{
		ID:          p.ID,
		NamespaceID: p.NamespaceID,
		Name:        p.Name,
		Description: p.Description,
		Content:     p.Content,
		Status:      p.Status,
		CreatedBy:   p.CreatedBy,
		CreatedAt:   p.CreatedAt,
		UpdatedAt:   p.UpdatedAt,
	}
}
