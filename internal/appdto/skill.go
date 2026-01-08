package appdto

import "time"

type CreateSkillReq struct {
	Name        string `json:"name" validate:"required,min=1,max=255,regex=^[a-zA-Z][a-zA-Z0-9_]*$"`
	Description string `json:"description" validate:"omitempty,min=1,max=255"`
}

type UpdateSkillReq struct {
	ID          string `json:"id" validate:"required" uri:"skill_id"`
	Name        string `json:"name" validate:"omitempty,min=1,max=255,regex=^[a-zA-Z][a-zA-Z0-9_]*$"`
	Description string `json:"description" validate:"omitempty,min=1,max=255"`
}

type Skill struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	CreatedBy   string    `json:"created_by"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}
