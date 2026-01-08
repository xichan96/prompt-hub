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
	GetPromptList(ctx context.Context, skillID, name, status string) ([]*appdto.Prompt, error)
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
	options = append(options, a.pp.Where(a.pp.F().SkillID.Eq(req.SkillID), a.pp.F().Status.Eq(appdto.PromptStatusDraft)))
	if _, err := a.pp.GetBy(ctx, options...); err == nil {
		return "", errors.New("draft prompt already exists for this skill")
	}
	if strings.TrimSpace(req.Content) == "" {
		req.Content = defaultAgentSkillsTemplate(req.Name)
	}
	// 如果不存在则插入
	nowTime := time.Now()
	prompt := &model.Prompt{
		SkillID:     req.SkillID,
		Name:        req.Name,
		Description: req.Description,
		Content:     req.Content,
		Config:      req.Config,
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
	if prompt.Config != req.Config {
		prompt.Config = req.Config
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
		a.pp.F().SkillID.Eq(draft.SkillID),
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
		SkillID:     draft.SkillID,
		Name:        draft.Name,
		Description: description,
		Content:     draft.Content,
		Config:      draft.Config,
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
		options = append(options, a.pp.Where(a.pp.F().SkillID.Eq(req.SkillID), a.pp.F().Name.Eq(req.Name)))
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
			a.pp.F().SkillID.Eq(req.SkillID),
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

func (a *app) GetPromptList(ctx context.Context, skillID, name, status string) ([]*appdto.Prompt, error) {
	options := make([]func(*gorm.DB) *gorm.DB, 0)
	if strings.TrimSpace(skillID) != "" {
		options = append(options, a.pp.Where(a.pp.F().SkillID.Eq(skillID)))
	}
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
		SkillID:     p.SkillID,
		Name:        p.Name,
		Description: p.Description,
		Content:     p.Content,
		Config:      p.Config,
		Status:      p.Status,
		CreatedBy:   p.CreatedBy,
		CreatedAt:   p.CreatedAt,
		UpdatedAt:   p.UpdatedAt,
	}
}

func defaultAgentSkillsTemplate(name string) string {
	if strings.TrimSpace(name) == "" {
		name = "Agent"
	}
	return "# 角色\n" +
		"你是「" + name + "」技能的智能体，负责针对用户目标进行分析、拆解与执行，并在必要时进行澄清与校验。\n\n" +
		"# 渐进式披露原则\n" +
		"- 先理解与澄清需求，再逐步展开细节与方案\n" +
		"- 每一步都提供可验证的中间结果与理由\n" +
		"- 在关键节点请求确认，避免过度一次性输出\n" +
		"- 根据反馈逐步加深，控制信息密度与节奏\n\n" +
		"# 技能清单\n" +
		"- 需求澄清与边界识别\n" +
		"- 任务拆解与路径规划\n" +
		"- 工具选择与调用（如 MCP 等）\n" +
		"- 内容/代码生成与修改\n" +
		"- 结果自检与误差控制\n" +
		"- 总结与下一步建议\n\n" +
		"# 工作流程\n" +
		"1. 读取输入并判断是否需要澄清，给出最少必要的提问\n" +
		"2. 识别约束与目标，产出简短的执行计划（1-3 步）\n" +
		"3. 逐步执行：每步先解释选择，再给出结果与可验证点\n" +
		"4. 必要时调用工具，并说明调用目的与预期\n" +
		"5. 汇总当前成果，提出可选下一步与取舍建议\n\n" +
		"# 输出格式\n" +
		"- 目标与假设\n" +
		"- 步骤与理由（简洁）\n" +
		"- 结果与校验点\n" +
		"- 下一步选项（优先级）\n"
}
