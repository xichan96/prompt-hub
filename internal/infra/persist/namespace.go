package persist

import (
	"context"

	"github.com/xichan96/prompt-hub/internal/infra/model"
	"github.com/xichan96/prompt-hub/pkg/sql"
	"github.com/xichan96/prompt-hub/pkg/std/snowflake"
	"gorm.io/gorm"
)

type NamespacePersistIer interface {
	sql.Corm

	Field() *model.NamespaceFieldMeta
	F() *model.NamespaceFieldMeta

	Create(ctx context.Context, namespace *model.Namespace) (string, error)
	CreateBatch(ctx context.Context, namespaces []*model.Namespace) error
	Update(ctx context.Context, namespace *model.Namespace, options ...func(*gorm.DB) *gorm.DB) error
	Get(ctx context.Context, data any, options ...func(*gorm.DB) *gorm.DB) error
	Gets(ctx context.Context, data any, options ...func(*gorm.DB) *gorm.DB) error
	GetBy(ctx context.Context, options ...func(*gorm.DB) *gorm.DB) (*model.Namespace, error)
	GetByID(ctx context.Context, id string) (*model.Namespace, error)
	GetList(ctx context.Context, options ...func(*gorm.DB) *gorm.DB) ([]*model.Namespace, error)
	Count(ctx context.Context, option ...func(db *gorm.DB) *gorm.DB) (int64, error)
	Delete(ctx context.Context, namespace *model.Namespace) error
	DeleteBatch(ctx context.Context, options ...func(*gorm.DB) *gorm.DB) error
}

func NewNamespacePersist() NamespacePersistIer {
	cp := &NamespacePersist{
		NamespaceFieldMeta: model.NamespaceFM,
	}
	return cp
}

type NamespacePersist struct {
	*model.NamespaceFieldMeta
	sql.BaseOpr
}

func (n *NamespacePersist) Field() *model.NamespaceFieldMeta {
	return n.NamespaceFieldMeta
}

func (n *NamespacePersist) F() *model.NamespaceFieldMeta {
	return n.NamespaceFieldMeta
}

func (n *NamespacePersist) Create(ctx context.Context, namespace *model.Namespace) (string, error) {
	if len(namespace.ID) == 0 {
		namespace.ID = snowflake.NewUUID()
	}

	if err := n.DB(ctx).Table(n.Table()).Create(&namespace).Error; err != nil {
		return "", err
	}
	return namespace.ID, nil
}

func (n *NamespacePersist) CreateBatch(ctx context.Context, namespaces []*model.Namespace) error {
	for _, namespace := range namespaces {
		if len(namespace.ID) == 0 {
			namespace.ID = snowflake.NewUUID()
		}
	}

	if err := n.DB(ctx).Table(n.Table()).CreateInBatches(&namespaces, 100).Error; err != nil {
		return err
	}
	return nil
}

func (n *NamespacePersist) Update(ctx context.Context, namespace *model.Namespace, options ...func(*gorm.DB) *gorm.DB) error {
	query := n.DB(ctx).Table(n.Table()).Scopes(options...).Updates(namespace)
	if err := query.Error; err != nil {
		return err
	}
	return nil
}

func (n *NamespacePersist) Get(ctx context.Context, data any, options ...func(*gorm.DB) *gorm.DB) error {
	query := n.DB(ctx).Table(n.Table()).Scopes(options...)
	if err := query.Take(data).Error; err != nil {
		return err
	}
	return nil
}

func (n *NamespacePersist) Gets(ctx context.Context, data any, options ...func(*gorm.DB) *gorm.DB) error {
	query := n.DB(ctx).Table(n.Table()).Scopes(options...)
	if err := query.Find(data).Error; err != nil {
		return err
	}
	return nil
}

func (n *NamespacePersist) GetBy(ctx context.Context, options ...func(*gorm.DB) *gorm.DB) (*model.Namespace, error) {
	var namespace model.Namespace
	query := n.DB(ctx).Table(n.Table()).Scopes(options...)
	if err := query.Take(&namespace).Error; err != nil {
		return nil, err
	}
	return &namespace, nil
}

func (n *NamespacePersist) GetByID(ctx context.Context, id string) (*model.Namespace, error) {
	var namespace model.Namespace
	query := n.DB(ctx).Table(n.Table()).Where(n.ID.Eq(id))
	if err := query.Take(&namespace).Error; err != nil {
		return nil, err
	}
	return &namespace, nil
}

func (n *NamespacePersist) GetList(ctx context.Context, options ...func(*gorm.DB) *gorm.DB) ([]*model.Namespace, error) {
	var namespaces []*model.Namespace
	query := n.DB(ctx).Table(n.Table()).Scopes(options...)
	if err := query.Find(&namespaces).Error; err != nil {
		return nil, err
	}
	return namespaces, nil
}

func (n *NamespacePersist) Delete(ctx context.Context, namespace *model.Namespace) error {
	if err := n.DB(ctx).Table(n.Table()).Where(n.ID.Eq(namespace.ID)).Delete(nil).Error; err != nil {
		return err
	}
	return nil
}

func (n *NamespacePersist) DeleteBatch(ctx context.Context, options ...func(*gorm.DB) *gorm.DB) error {
	if err := n.DB(ctx).Table(n.Table()).Scopes(options...).Delete(nil).Error; err != nil {
		return err
	}
	return nil
}

func (n *NamespacePersist) Count(ctx context.Context, option ...func(db *gorm.DB) *gorm.DB) (int64, error) {
	var count int64
	if err := n.DB(ctx).Table(n.Table()).Scopes(option...).Count(&count).Error; err != nil {
		return 0, err
	}
	return count, nil
}
