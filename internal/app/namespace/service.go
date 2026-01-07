package namespace

import (
	"context"

	"github.com/xichan96/prompt-hub/internal/appdto"
	"github.com/xichan96/prompt-hub/internal/infra/model"
	"github.com/xichan96/prompt-hub/internal/infra/persist"
	"github.com/xichan96/prompt-hub/internal/pkg/errcode"
	"github.com/xichan96/prompt-hub/pkg/ec"
	"github.com/xichan96/prompt-hub/pkg/web/cctx"
	"gorm.io/gorm"
)

type AppIer interface {
	CreateNamespace(ctx context.Context, req *appdto.CreateNamespaceReq) (string, error)
	UpdateNamespace(ctx context.Context, req *appdto.UpdateNamespaceReq) error
	DeleteNamespace(ctx context.Context, id string) error
	GetNamespaces(ctx context.Context) ([]*appdto.Namespace, error)
}

type app struct {
	nps persist.NamespacePersistIer
}

func NewApp(nps persist.NamespacePersistIer) AppIer {
	return &app{
		nps: nps,
	}
}

func (a *app) CreateNamespace(ctx context.Context, req *appdto.CreateNamespaceReq) (string, error) {
	existingNamespace, err := a.nps.GetBy(ctx, a.nps.Where(
		a.nps.F().Name.Eq(req.Name),
	))
	if err != nil && !ec.IsErrCode(err, ec.NoFound) {
		return "", err
	}
	if existingNamespace != nil {
		return "", errcode.NamespaceNameExisted
	}

	namespace := &model.Namespace{
		Name:        req.Name,
		Description: req.Description,
		CreatedBy:   cctx.GetUserID[string](ctx),
	}
	return a.nps.Create(ctx, namespace)
}

func (a *app) UpdateNamespace(ctx context.Context, req *appdto.UpdateNamespaceReq) error {
	if len(req.Name) > 0 {
		existingNamespace, err := a.nps.GetBy(ctx, a.nps.Where(
			a.nps.F().Name.Eq(req.Name),
			a.nps.F().ID.Neq(req.ID),
		))
		if err != nil && !ec.IsErrCode(err, ec.NoFound) {
			return err
		}
		if existingNamespace != nil {
			return errcode.NamespaceNameExisted
		}
	}

	namespace := &model.Namespace{
		ID:          req.ID,
		Name:        req.Name,
		Description: req.Description,
	}
	return a.nps.Update(ctx, namespace, a.nps.Where(a.nps.F().ID.Eq(req.ID)))
}

func (a *app) DeleteNamespace(ctx context.Context, id string) error {
	namespace := &model.Namespace{
		ID: id,
	}
	return a.nps.Delete(ctx, namespace)
}

func (a *app) GetNamespaces(ctx context.Context) ([]*appdto.Namespace, error) {
	var options []func(*gorm.DB) *gorm.DB
	userRole := cctx.GetUserRole[string](ctx)
	if userRole != "admin" {
		userID := cctx.GetUserID[string](ctx)
		options = append(options, a.nps.Where(a.nps.F().CreatedBy.Eq(userID)))
	}

	namespaces, err := a.nps.GetList(ctx, options...)
	if err != nil {
		return nil, err
	}
	result := make([]*appdto.Namespace, 0, len(namespaces))
	for _, n := range namespaces {
		result = append(result, &appdto.Namespace{
			ID:          n.ID,
			Name:        n.Name,
			Description: n.Description,
			CreatedAt:   n.CreatedAt,
			UpdatedAt:   n.UpdatedAt,
		})
	}
	return result, nil
}
