package appdto

import "time"

const (
	PromptStatusDraft     = "draft"
	PromptStatusPublished = "published"
	PromptStatusArchived  = "archived"
)

type CreatePromptDraftReq struct {
	SkillID     string `uri:"skill_id"`
	Name        string `json:"name" validate:"required,min=1,max=255"`
	Description string `json:"description" validate:"omitempty,min=1,max=255"`
	Content     string `json:"content" validate:"required,min=1"`
	Config      string `json:"config" validate:"omitempty"`
}

type UpdatePromptDraftReq struct {
	ID          string `json:"id" uri:"prompt_id"`
	Description string `json:"description" validate:"omitempty,min=1,max=255"`
	Content     string `json:"content" validate:"omitempty,min=1"`
	Config      string `json:"config" validate:"omitempty"`
}

type PublishPromptReq struct {
	ID          string `json:"id" uri:"prompt_id"`
	Description string `json:"description" validate:"omitempty,min=1,max=255"`
}

type DeletePromptReq struct {
	ID      string `json:"id,omitempty" uri:"prompt_id"`
	SkillID string `json:"skill_id" uri:"skill_id"`
	Name    string `json:"name"`
}

type GetPromptReq struct {
	ID      string `json:"id,omitempty" uri:"prompt_id"`
	Name    string `json:"name" form:"name"`
	SkillID string `json:"skill_id" form:"skill_id" uri:"skill_id"`
	Status  string `json:"status" form:"status"`
}

type Prompt struct {
	ID          string    `json:"id"`
	SkillID     string    `json:"skill_id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Content     string    `json:"content"`
	Config      string    `json:"config"`
	Status      string    `json:"status"`
	CreatedBy   string    `json:"created_by"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}
