package appdto

import "time"

type CreateSettingReq struct {
	Group string `json:"group" validate:"required,min=1,max=64"`
	Key   string `json:"key" validate:"required,min=1,max=64"`
	Value string `json:"value" validate:"required"`
}

type UpdateSettingReq struct {
	Group string `json:"group" validate:"required,min=1,max=64"`
	Key   string `json:"key" validate:"required,min=1,max=64"`
	Value string `json:"value" validate:"required"`
}

type DeleteSettingReq struct {
	Group string `json:"group" validate:"required,min=1,max=64"`
	Key   string `json:"key" validate:"required,min=1,max=64"`
}

type GetSettingReq struct {
	Group string `json:"group" validate:"required,min=1,max=64"`
	Key   string `json:"key" validate:"required,min=1,max=64"`
}

type GetSettingsReq struct {
	Group string `json:"group" validate:"omitempty,min=1,max=64"`
}

type Setting struct {
	Group     string    `json:"group"`
	Key       string    `json:"key"`
	Value     string    `json:"value"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

