package handler

import (
	"github.com/gin-gonic/gin"
	"github.com/xichan96/prompt-hub/pkg/web/gx"

	"github.com/xichan96/prompt-hub/internal/appdto"
	"github.com/xichan96/prompt-hub/internal/di"
)

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

func UpdateNamespaceAPI(c *gin.Context) {
	var req appdto.UpdateNamespaceReq
	if err := c.ShouldBindJSON(&req); err != nil {
		gx.JSONErr(c, gx.BErr(err))
		return
	}
	err := di.NamespaceApp.UpdateNamespace(c, &req)
	if err != nil {
		gx.JSONErr(c, err)
		return
	}
	gx.JSONSuccess(c, nil)
}

func DeleteNamespaceAPI(c *gin.Context) {
	var req struct {
		ID string `uri:"id" binding:"required"`
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

func GetNamespacesAPI(c *gin.Context) {
	namespaces, err := di.NamespaceApp.GetNamespaces(c)
	if err != nil {
		gx.JSONErr(c, err)
		return
	}
	gx.JSONSuccess(c, namespaces)
}
