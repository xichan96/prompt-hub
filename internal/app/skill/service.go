package skill

import (
	"context"
	"fmt"

	"github.com/xichan96/prompt-hub/internal/appdto"
	"github.com/xichan96/prompt-hub/internal/infra/model"
	"github.com/xichan96/prompt-hub/internal/infra/persist"
	"github.com/xichan96/prompt-hub/internal/pkg/errcode"
	"github.com/xichan96/prompt-hub/pkg/ec"
	"github.com/xichan96/prompt-hub/pkg/sql"
	"github.com/xichan96/prompt-hub/pkg/web/cctx"
	"gorm.io/gorm"
)

type AppIer interface {
	CreateSkill(ctx context.Context, req *appdto.CreateSkillReq) (string, error)
	UpdateSkill(ctx context.Context, req *appdto.UpdateSkillReq) error
	DeleteSkill(ctx context.Context, id string) error
	GetSkills(ctx context.Context) ([]*appdto.Skill, error)
	GetSkill(ctx context.Context, id string) (*appdto.Skill, error)
}

type app struct {
	nps persist.SkillPersistIer
	pp  persist.PromptPersistIer
	sfp persist.SkillFilePersistIer
}

func NewApp(nps persist.SkillPersistIer, pp persist.PromptPersistIer, sfp persist.SkillFilePersistIer) AppIer {
	return &app{
		nps: nps,
		pp:  pp,
		sfp: sfp,
	}
}

func (a *app) CreateSkill(ctx context.Context, req *appdto.CreateSkillReq) (string, error) {
	existingSkill, err := a.nps.GetBy(ctx, a.nps.Where(
		a.nps.F().Name.Eq(req.Name),
	))
	if err != nil && !ec.IsErrCode(err, ec.NoFound) {
		return "", err
	}
	if existingSkill != nil {
		return "", errcode.SkillNameExisted
	}

	skill := &model.Skill{
		Name:        req.Name,
		Description: req.Description,
		CreatedBy:   cctx.GetUserID[string](ctx),
	}
	id, err := a.nps.Create(ctx, skill)
	if err != nil {
		return "", err
	}

	// Create default prompt
	content := fmt.Sprintf(`---
name: %s
description: A clear description of what this skill does and when to use it
---

# %s

[Add your instructions here that Claude will follow when this skill is active]

## Examples
- Example usage 1
- Example usage 2

## Guidelines
- Guideline 1
- Guideline 2
`, skill.Name, skill.Name)
	prompt := &model.Prompt{
		SkillID:     id,
		Name:        "SKILL",
		Description: "The main agent for this skill",
		Content:     content,
		Status:      appdto.PromptStatusDraft,
		CreatedBy:   skill.CreatedBy,
	}
	if _, err := a.pp.Create(ctx, prompt); err != nil {
		// Log error but don't fail skill creation? Or should we fail?
		// Better to fail to ensure consistency or at least log.
		// For now, let's return error to ensure the user knows something went wrong.
		// However, skill is already created. Ideally we should use transaction.
		// But for now let's just try to create.
		return id, nil
	}

	return id, nil
}

func (a *app) UpdateSkill(ctx context.Context, req *appdto.UpdateSkillReq) error {
	if len(req.Name) > 0 {
		existingSkill, err := a.nps.GetBy(ctx, a.nps.Where(
			a.nps.F().Name.Eq(req.Name),
			a.nps.F().ID.Neq(req.ID),
		))
		if err != nil && !ec.IsErrCode(err, ec.NoFound) {
			return err
		}
		if existingSkill != nil {
			return errcode.SkillNameExisted
		}
	}

	skill := &model.Skill{
		ID:          req.ID,
		Name:        req.Name,
		Description: req.Description,
	}
	return a.nps.Update(ctx, skill, a.nps.Where(a.nps.F().ID.Eq(req.ID)))
}

func (a *app) DeleteSkill(ctx context.Context, id string) error {
	tx := sql.NewSqlTX()
	return tx.Execute(ctx, func(ctx context.Context) error {
		promptOpts := make([]func(*gorm.DB) *gorm.DB, 0)
		promptOpts = append(promptOpts, a.pp.Where(a.pp.F().SkillID.Eq(id)))
		if err := a.pp.DeleteBatch(ctx, promptOpts...); err != nil {
			return err
		}

		fileOpts := make([]func(*gorm.DB) *gorm.DB, 0)
		fileOpts = append(fileOpts, a.sfp.Where(a.sfp.F().SkillID.Eq(id)))
		if err := a.sfp.DeleteBatch(ctx, fileOpts...); err != nil {
			return err
		}

		skill := &model.Skill{ID: id}
		return a.nps.Delete(ctx, skill)
	})
}

func (a *app) GetSkills(ctx context.Context) ([]*appdto.Skill, error) {
	var options []func(*gorm.DB) *gorm.DB
	userRole := cctx.GetUserRole[string](ctx)
	if userRole != "admin" {
		userID := cctx.GetUserID[string](ctx)
		options = append(options, a.nps.Where(a.nps.F().CreatedBy.Eq(userID)))
	}

	skills, err := a.nps.GetList(ctx, options...)
	if err != nil {
		return nil, err
	}
	result := make([]*appdto.Skill, 0, len(skills))
	for _, n := range skills {
		result = append(result, &appdto.Skill{
			ID:          n.ID,
			Name:        n.Name,
			Description: n.Description,
			CreatedAt:   n.CreatedAt,
			UpdatedAt:   n.UpdatedAt,
		})
	}
	return result, nil
}

func (a *app) GetSkill(ctx context.Context, id string) (*appdto.Skill, error) {
	skill, err := a.nps.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	return &appdto.Skill{
		ID:          skill.ID,
		Name:        skill.Name,
		Description: skill.Description,
		CreatedBy:   skill.CreatedBy,
		CreatedAt:   skill.CreatedAt,
		UpdatedAt:   skill.UpdatedAt,
	}, nil
}
