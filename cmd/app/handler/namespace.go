package handler

import (
	"github.com/gin-gonic/gin"
	"github.com/xichan96/prompt-hub/pkg/web/gx"

	"github.com/xichan96/prompt-hub/internal/appdto"
	"github.com/xichan96/prompt-hub/internal/di"
)

// CreateNamespaceAPI    创建命名空间 godoc
// @Summary               创建命名空间
// @Description           创建新命名空间
// @Tags                  命名空间管理
// @Accept                json
// @Produce               json
// @Param                 body    body        appdto.CreateNamespaceReq true    "命名空间信息"
// @Success               200     {object}    appdto.CreateIDResponse  "创建成功"
// @Router                /api/namespaces [post]
func CreateNamespaceAPI(c *gin.Context) {
	var req appdto.CreateNamespaceReq
	if err := c.ShouldBindJSON(&req); err != nil {
		gx.JSONErr(c, gx.BErr(err))
		return
	}
	id, err := di.NamespaceApp.CreateNamespace(c, &req)
	if err != nil {
		gx.JSONErr(c, err)
		return
	}
	gx.JSONSuccess(c, map[string]string{"id": id})
}

// UpdateNamespaceAPI    更新命名空间 godoc
// @Summary               更新命名空间
// @Description           更新命名空间信息
// @Tags                  命名空间管理
// @Accept                json
// @Produce               json
// @Param                 namespace_id      path        string                  true    "命名空间ID"
// @Param                 body    body        appdto.UpdateNamespaceReq true    "命名空间信息"
// @Success               200     {object}    appdto.EmptyResponse         "更新成功"
// @Router                /api/namespaces/:namespace_id [put]
func UpdateNamespaceAPI(c *gin.Context) {
	var uriReq struct {
		ID string `uri:"namespace_id" binding:"required"`
	}
	if err := c.ShouldBindUri(&uriReq); err != nil {
		gx.JSONErr(c, gx.BErr(err))
		return
	}
	var req appdto.UpdateNamespaceReq
	if err := c.ShouldBindJSON(&req); err != nil {
		gx.JSONErr(c, gx.BErr(err))
		return
	}
	req.ID = uriReq.ID
	err := di.NamespaceApp.UpdateNamespace(c, &req)
	if err != nil {
		gx.JSONErr(c, err)
		return
	}
	gx.JSONSuccess(c, nil)
}

// DeleteNamespaceAPI    删除命名空间 godoc
// @Summary               删除命名空间
// @Description           删除指定命名空间
// @Tags                  命名空间管理
// @Accept                json
// @Produce               json
// @Param                 namespace_id      path        string          true    "命名空间ID"
// @Success               200     {object}    appdto.EmptyResponse "删除成功"
// @Router                /api/namespaces/:namespace_id [delete]
func DeleteNamespaceAPI(c *gin.Context) {
	var req struct {
		ID string `uri:"namespace_id" binding:"required"`
	}
	if err := c.ShouldBindUri(&req); err != nil {
		gx.JSONErr(c, gx.BErr(err))
		return
	}
	err := di.NamespaceApp.DeleteNamespace(c, req.ID)
	if err != nil {
		gx.JSONErr(c, err)
		return
	}
	gx.JSONSuccess(c, nil)
}

// GetNamespacesAPI      获取命名空间列表 godoc
// @Summary               获取命名空间列表
// @Description           获取所有命名空间列表
// @Tags                  命名空间管理
// @Accept                json
// @Produce               json
// @Success               200     {object}    appdto.NamespaceListResponse  "获取成功"
// @Router                /api/namespaces [get]
func GetNamespacesAPI(c *gin.Context) {
	namespaces, err := di.NamespaceApp.GetNamespaces(c)
	if err != nil {
		gx.JSONErr(c, err)
		return
	}
	gx.JSONSuccess(c, namespaces)
}
