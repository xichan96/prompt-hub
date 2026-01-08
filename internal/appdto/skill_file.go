package appdto

import "time"

type CreateSkillFileReq struct {
	SkillID     string `uri:"skill_id" json:"skill_id"`
	Name        string `json:"name" validate:"required,min=1,max=255"`
	Description string `json:"description" validate:"omitempty,max=1024"`
	Content     string `json:"content" validate:"required"`
}

type UpdateSkillFileReq struct {
	ID          string `uri:"file_id" json:"id"`
	Description string `json:"description" validate:"omitempty,max=1024"`
	Content     string `json:"content" validate:"omitempty"`
}

type DeleteSkillFileReq struct {
	ID      string `uri:"file_id" json:"id"`
	SkillID string `uri:"skill_id" json:"skill_id"`
}

type GetSkillFileReq struct {
	ID      string `uri:"file_id" json:"id"`
	SkillID string `uri:"skill_id" json:"skill_id"`
	Name    string `form:"name" json:"name"`
}

type SkillFile struct {
	ID          string    `json:"id"`
	SkillID     string    `json:"skill_id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Content     string    `json:"content"`
	CreatedBy   string    `json:"created_by"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}
