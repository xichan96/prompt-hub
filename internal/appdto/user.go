package appdto

import "time"

type CreateUserReq struct {
	Username string `json:"username" validate:"required,min=1,max=255"`
	Password string `json:"password" validate:"required,min=1,max=255"`
	Role     string `json:"role" validate:"omitempty,min=1,max=255"`
}

type UpdateUserReq struct {
	ID       string `json:"id" validate:"required,min=1,max=255"`
	Username string `json:"username" validate:"omitempty,min=1,max=255"`
	Password string `json:"password" validate:"omitempty,min=1,max=255"`
	Role     string `json:"role" validate:"omitempty,min=1,max=255"`
}

type LoginRequest struct {
	Username string `json:"username" validate:"required,min=1,max=255"`
	Password string `json:"password" validate:"required,min=1,max=255"`
}

type LoginResponse struct {
	Token string `json:"token"`
}

type User struct {
	ID        string    `json:"id"`
	Username  string    `json:"username"`
	Role      string    `json:"role"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
