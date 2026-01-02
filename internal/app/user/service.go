package user

import (
	"context"
	"time"

	"github.com/jinzhu/copier"
	"github.com/xichan96/prompt-hub/internal/appdto"
	"github.com/xichan96/prompt-hub/internal/infra/model"
	"github.com/xichan96/prompt-hub/internal/infra/persist"
	"github.com/xichan96/prompt-hub/internal/pkg/errcode"
	"github.com/xichan96/prompt-hub/pkg/ec"
	"github.com/xichan96/prompt-hub/pkg/web/jwt"
	"golang.org/x/crypto/bcrypt"
)

type AppIer interface {
	CreateUser(ctx context.Context, req *appdto.CreateUserReq) (string, error)
	UpdateUser(ctx context.Context, req *appdto.UpdateUserReq) error
	DeleteUser(ctx context.Context, id string) error
	GetUsers(ctx context.Context) ([]*appdto.User, error)
	LoginWithPassword(ctx context.Context, req *appdto.LoginRequest) (*appdto.LoginResponse, error)
}

type app struct {
	up persist.UserPersistIer
}

func NewApp(up persist.UserPersistIer) AppIer {
	return &app{up: up}
}

func (a *app) CreateUser(ctx context.Context, req *appdto.CreateUserReq) (string, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return a.up.Create(ctx, &model.User{
		Username: req.Username,
		Password: string(hashedPassword),
		Role:     req.Role,
	})
}

func (a *app) UpdateUser(ctx context.Context, req *appdto.UpdateUserReq) error {
	user, err := a.up.GetByID(ctx, req.ID)
	if err != nil {
		return err
	}
	if len(req.Password) > 0 && user.Password != req.Password {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
		if err != nil {
			return err
		}
		user.Password = string(hashedPassword)
	}
	if len(req.Role) > 0 && user.Role != req.Role {
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

func (a *app) LoginWithPassword(ctx context.Context, req *appdto.LoginRequest) (*appdto.LoginResponse, error) {
	user, err := a.up.GetBy(ctx, a.up.Where(
		a.up.F().Username.Eq(req.Username),
	))
	if err != nil {
		if ec.IsErrCode(err, ec.NoFound) {
			return nil, errcode.UserPasswordError
		}
		return nil, err
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		return nil, errcode.UserPasswordError
	}

	userData := map[string]interface{}{
		"id":       user.ID,
		"username": user.Username,
		"role":     user.Role,
	}

	token, err := jwt.DefaultToken.Encode(userData)
	if err != nil {
		return nil, err
	}

	return &appdto.LoginResponse{
		Token: token,
	}, nil
}
