package appdto

import "time"

const (
	PromptStatusDraft     = "draft"
	PromptStatusPublished = "published"
	PromptStatusArchived  = "archived"
)

type CreatePromptDraftReq struct {
	NamespaceID string `uri:"namespace_id"`
	Name        string `json:"name" validate:"required,min=1,max=255"`
	Description string `json:"description" validate:"omitempty,min=1,max=255"`
	Content     string `json:"content" validate:"required,min=1"`
}

type UpdatePromptDraftReq struct {
	ID          string `json:"id" uri:"prompt_id"`
	Description string `json:"description" validate:"omitempty,min=1,max=255"`
	Content     string `json:"content" validate:"omitempty,min=1"`
}

type PublishPromptReq struct {
	ID          string `json:"id" uri:"prompt_id"`
	Description string `json:"description" validate:"omitempty,min=1,max=255"`
}

type DeletePromptReq struct {
	ID          string `json:"id,omitempty" uri:"prompt_id"`
	NamespaceID string `json:"namespace_id" uri:"namespace_id"`
	Name        string `json:"name"`
}

type GetPromptReq struct {
	ID          string `json:"id,omitempty" uri:"prompt_id"`
	Name        string `json:"name" form:"name"`
	NamespaceID string `json:"namespace_id" form:"namespace_id" uri:"namespace_id"`
	Status      string `json:"status" form:"status"`
}

type Prompt struct {
	ID          string    `json:"id"`
	NamespaceID string    `json:"namespace_id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Content     string    `json:"content"`
	Status      string    `json:"status"`
	CreatedBy   string    `json:"created_by"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}
