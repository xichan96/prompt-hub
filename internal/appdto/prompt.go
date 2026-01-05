package appdto

import "time"

const (
	PromptStatusDraft     = "draft"
	PromptStatusPublished = "published"
	PromptStatusArchived  = "archived"
)

type CreatePromptDraftReq struct {
	NamespaceID string
	Name        string `json:"name" validate:"required,min=1,max=255"`
	Description string `json:"description" validate:"omitempty,min=1,max=255"`
	Content     string `json:"content" validate:"required,min=1"`
}

type UpdatePromptDraftReq struct {
	ID          string `json:"id"`
	Description string `json:"description" validate:"omitempty,min=1,max=255"`
	Content     string `json:"content" validate:"omitempty,min=1"`
}

type PublishPromptReq struct {
	ID          string `json:"id"`
	Description string `json:"description" validate:"omitempty,min=1,max=255"`
}

type DeletePromptReq struct {
	ID          string `json:"id,omitempty"`
	NamespaceID string `json:"namespace_id"`
	Name        string `json:"name"`
}

type GetPromptReq struct {
	ID          string `json:"id,omitempty"`
	Name        string `json:"name"`
	NamespaceID string `json:"namespace_id"`
	Status      string `json:"status"`
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
