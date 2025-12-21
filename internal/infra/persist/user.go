package persist

import (
	"context"

	"github.com/xichan96/prompt-hub/internal/infra/model"
	"github.com/xichan96/prompt-hub/pkg/sql"
	"github.com/xichan96/prompt-hub/pkg/std/snowflake"
	"gorm.io/gorm"
)

type UserPersistIer interface {
	sql.Corm

	Field() *model.UserFieldMeta
	F() *model.UserFieldMeta

	Create(ctx context.Context, user *model.User) (string, error)
	CreateBatch(ctx context.Context, users []*model.User) error
	Update(ctx context.Context, user *model.User, options ...func(*gorm.DB) *gorm.DB) error
	Get(ctx context.Context, data any, options ...func(*gorm.DB) *gorm.DB) error
	Gets(ctx context.Context, data any, options ...func(*gorm.DB) *gorm.DB) error
	GetBy(ctx context.Context, options ...func(*gorm.DB) *gorm.DB) (*model.User, error)
	GetByID(ctx context.Context, id string) (*model.User, error)
	GetList(ctx context.Context, options ...func(*gorm.DB) *gorm.DB) ([]*model.User, error)
	Count(ctx context.Context, option ...func(db *gorm.DB) *gorm.DB) (int64, error)
	Delete(ctx context.Context, user *model.User) error
	DeleteBatch(ctx context.Context, options ...func(*gorm.DB) *gorm.DB) error
}

func NewUserPersist() UserPersistIer {
	cp := &UserPersist{
		UserFieldMeta: model.UserFM,
	}
	return cp
}

type UserPersist struct {
	*model.UserFieldMeta
	sql.BaseOpr
}

func (u *UserPersist) Field() *model.UserFieldMeta {
	return u.UserFieldMeta
}

func (u *UserPersist) F() *model.UserFieldMeta {
	return u.UserFieldMeta
}

func (u *UserPersist) Create(ctx context.Context, user *model.User) (string, error) {
	if len(user.ID) == 0 {
		user.ID = snowflake.NewUUID()
	}

	if err := u.DB(ctx).Table(u.Table()).Create(&user).Error; err != nil {
		return "", err
	}
	return user.ID, nil
}

func (u *UserPersist) CreateBatch(ctx context.Context, users []*model.User) error {
	for _, user := range users {
		if len(user.ID) == 0 {
			user.ID = snowflake.NewUUID()
		}
	}

	if err := u.DB(ctx).Table(u.Table()).CreateInBatches(&users, 100).Error; err != nil {
		return err
	}
	return nil
}

func (u *UserPersist) Update(ctx context.Context, user *model.User, options ...func(*gorm.DB) *gorm.DB) error {
	query := u.DB(ctx).Table(u.Table()).Scopes(options...).Updates(user)
	if err := query.Error; err != nil {
		return err
	}
	return nil
}

func (u *UserPersist) Get(ctx context.Context, data any, options ...func(*gorm.DB) *gorm.DB) error {
	query := u.DB(ctx).Table(u.Table()).Scopes(options...)
	if err := query.Take(data).Error; err != nil {
		return err
	}
	return nil
}

func (u *UserPersist) Gets(ctx context.Context, data any, options ...func(*gorm.DB) *gorm.DB) error {
	query := u.DB(ctx).Table(u.Table()).Scopes(options...)
	if err := query.Find(data).Error; err != nil {
		return err
	}
	return nil
}

func (u *UserPersist) GetBy(ctx context.Context, options ...func(*gorm.DB) *gorm.DB) (*model.User, error) {
	var user model.User
	query := u.DB(ctx).Table(u.Table()).Scopes(options...)
	if err := query.Take(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (u *UserPersist) GetByID(ctx context.Context, id string) (*model.User, error) {
	var user model.User
	query := u.DB(ctx).Table(u.Table()).Where(u.ID.Eq(id))
	if err := query.Take(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (u *UserPersist) GetList(ctx context.Context, options ...func(*gorm.DB) *gorm.DB) ([]*model.User, error) {
	var users []*model.User
	query := u.DB(ctx).Table(u.Table()).Scopes(options...)
	if err := query.Find(&users).Error; err != nil {
		return nil, err
	}
	return users, nil
}

func (u *UserPersist) Delete(ctx context.Context, user *model.User) error {
	if err := u.DB(ctx).Table(u.Table()).Where(u.ID.Eq(user.ID)).Delete(nil).Error; err != nil {
		return err
	}
	return nil
}

func (u *UserPersist) DeleteBatch(ctx context.Context, options ...func(*gorm.DB) *gorm.DB) error {
	if err := u.DB(ctx).Table(u.Table()).Scopes(options...).Delete(nil).Error; err != nil {
		return err
	}
	return nil
}

func (u *UserPersist) Count(ctx context.Context, option ...func(db *gorm.DB) *gorm.DB) (int64, error) {
	var count int64
	if err := u.DB(ctx).Table(u.Table()).Scopes(option...).Count(&count).Error; err != nil {
		return 0, err
	}
	return count, nil
}
