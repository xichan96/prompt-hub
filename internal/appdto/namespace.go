package appdto

import "time"

type CreateNamespaceReq struct {
	Name        string `json:"name" validate:"required,min=1,max=255,regex=^[a-zA-Z][a-zA-Z0-9_]*$"`
	Description string `json:"description" validate:"omitempty,min=1,max=255"`
}

type UpdateNamespaceReq struct {
	ID          string `json:"id" validate:"required"`
	Name        string `json:"name" validate:"omitempty,min=1,max=255,regex=^[a-zA-Z][a-zA-Z0-9_]*$"`
	Description string `json:"description" validate:"omitempty,min=1,max=255"`
}

type Namespace struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}
