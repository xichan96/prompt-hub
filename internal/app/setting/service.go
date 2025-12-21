package setting

import (
	"context"

	"github.com/jinzhu/copier"
	"github.com/xichan96/prompt-hub/internal/appdto"
	"github.com/xichan96/prompt-hub/internal/infra/model"
	"github.com/xichan96/prompt-hub/internal/infra/persist"
	"gorm.io/gorm"
)

type AppIer interface {
	CreateSetting(ctx context.Context, req *appdto.CreateSettingReq) error
	UpdateSetting(ctx context.Context, req *appdto.UpdateSettingReq) error
	DeleteSetting(ctx context.Context, req *appdto.DeleteSettingReq) error
	GetSetting(ctx context.Context, req *appdto.GetSettingReq) (*appdto.Setting, error)
	GetSettings(ctx context.Context, req *appdto.GetSettingsReq) ([]*appdto.Setting, error)
}

type app struct {
	sp persist.SettingPersistIer
}

func NewApp(sp persist.SettingPersistIer) AppIer {
	return &app{sp: sp}
}

func (a *app) CreateSetting(ctx context.Context, req *appdto.CreateSettingReq) error {
	setting := &model.Setting{
		Group: req.Group,
		Key:   req.Key,
		Value: req.Value,
	}
	_, err := a.sp.Create(ctx, setting)
	return err
}

func (a *app) UpdateSetting(ctx context.Context, req *appdto.UpdateSettingReq) error {
	options := make([]func(*gorm.DB) *gorm.DB, 0)
	options = append(options, a.sp.Where(a.sp.F().Group.Eq(req.Group), a.sp.F().Key.Eq(req.Key)))
	setting, err := a.sp.GetBy(ctx, options...)
	if err != nil {
		return err
	}
	setting.Value = req.Value
	return a.sp.Update(ctx, setting, options...)
}

func (a *app) DeleteSetting(ctx context.Context, req *appdto.DeleteSettingReq) error {
	options := make([]func(*gorm.DB) *gorm.DB, 0)
	options = append(options, a.sp.Where(a.sp.F().Group.Eq(req.Group), a.sp.F().Key.Eq(req.Key)))
	return a.sp.DeleteBatch(ctx, options...)
}

func (a *app) GetSetting(ctx context.Context, req *appdto.GetSettingReq) (*appdto.Setting, error) {
	options := make([]func(*gorm.DB) *gorm.DB, 0)
	options = append(options, a.sp.Where(a.sp.F().Group.Eq(req.Group), a.sp.F().Key.Eq(req.Key)))
	setting, err := a.sp.GetBy(ctx, options...)
	if err != nil {
		return nil, err
	}
	result := &appdto.Setting{}
	copier.Copy(result, setting)
	return result, nil
}

func (a *app) GetSettings(ctx context.Context, req *appdto.GetSettingsReq) ([]*appdto.Setting, error) {
	options := make([]func(*gorm.DB) *gorm.DB, 0)
	if req.Group != "" {
		options = append(options, a.sp.Where(a.sp.F().Group.Eq(req.Group)))
	}
	settings, err := a.sp.GetList(ctx, options...)
	if err != nil {
		return nil, err
	}
	result := make([]*appdto.Setting, 0, len(settings))
	for _, s := range settings {
		setting := &appdto.Setting{}
		copier.Copy(setting, s)
		result = append(result, setting)
	}
	return result, nil
}
