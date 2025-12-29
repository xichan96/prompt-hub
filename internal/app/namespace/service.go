package namespace

import (
	"context"

	"github.com/xichan96/prompt-hub/internal/appdto"
	"github.com/xichan96/prompt-hub/internal/infra/model"
	"github.com/xichan96/prompt-hub/internal/infra/persist"
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
	namespace := &model.Namespace{
		Name:        req.Name,
		Description: req.Description,
	}
	return a.nps.Create(ctx, namespace)
}

func (a *app) UpdateNamespace(ctx context.Context, req *appdto.UpdateNamespaceReq) error {
	namespace := &model.Namespace{
		ID:          req.ID,
		Name:        req.Name,
		Description: req.Description,
	}
	return a.nps.Update(ctx, namespace)
}

func (a *app) DeleteNamespace(ctx context.Context, id string) error {
	namespace := &model.Namespace{
		ID: id,
	}
	return a.nps.Delete(ctx, namespace)
}

func (a *app) GetNamespaces(ctx context.Context) ([]*appdto.Namespace, error) {
	namespaces, err := a.nps.GetList(ctx)
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
