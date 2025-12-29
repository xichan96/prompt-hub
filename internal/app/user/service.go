package user

import (
	"context"
	"time"

	"github.com/jinzhu/copier"
	"github.com/xichan96/prompt-hub/internal/appdto"
	"github.com/xichan96/prompt-hub/internal/infra/model"
	"github.com/xichan96/prompt-hub/internal/infra/persist"
)

type AppIer interface {
	CreateUser(ctx context.Context, req *appdto.CreateUserReq) (string, error)
	UpdateUser(ctx context.Context, req *appdto.UpdateUserReq) error
	DeleteUser(ctx context.Context, id string) error
	GetUsers(ctx context.Context) ([]*appdto.User, error)
}

type app struct {
	up persist.UserPersistIer
}

func NewApp(up persist.UserPersistIer) AppIer {
	return &app{up: up}
}

func (a *app) CreateUser(ctx context.Context, req *appdto.CreateUserReq) (string, error) {
	return a.up.Create(ctx, &model.User{
		Username: req.Username,
		Password: req.Password,
		Role:     req.Role,
	})
}

func (a *app) UpdateUser(ctx context.Context, req *appdto.UpdateUserReq) error {
	user, err := a.up.GetByID(ctx, req.ID)
	if err != nil {
		return err
	}
	if user.Password != req.Password {
		user.Password = req.Password
	}
	if user.Role != req.Role {
		user.Role = req.Role
	}
	user.UpdatedAt = time.Now()
	return a.up.Update(ctx, user)
}

func (a *app) DeleteUser(ctx context.Context, id string) error {
	user, err := a.up.GetByID(ctx, id)
	if err != nil {
		return err
	}
	return a.up.Delete(ctx, user)
}

func (a *app) GetUsers(ctx context.Context) ([]*appdto.User, error) {
	users, err := a.up.GetList(ctx)
	if err != nil {
		return nil, err
	}
	appUsers := make([]*appdto.User, len(users))
	for _, user := range users {
		appUser := &appdto.User{}
		copier.Copy(appUser, user)
		appUsers = append(appUsers, appUser)
	}
	return appUsers, nil
}
