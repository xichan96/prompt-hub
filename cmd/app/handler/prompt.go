package handler

import (
	"github.com/gin-gonic/gin"
	"github.com/xichan96/prompt-hub/pkg/web/gx"

	"github.com/xichan96/prompt-hub/internal/appdto"
	"github.com/xichan96/prompt-hub/internal/di"
)

func CreatePromptAPI(c *gin.Context) {
	var req appdto.CreatePromptDraftReq
	if err := c.ShouldBindJSON(&req); err != nil {
		gx.JSONErr(c, gx.BErr(err))
		return
	}
	var uriReq struct {
		NamespaceID string `uri:"namespace_id" binding:"required"`
	}
	if err := c.ShouldBindUri(&uriReq); err != nil {
		gx.JSONErr(c, gx.BErr(err))
		return
	}
	req.NamespaceID = uriReq.NamespaceID
	id, err := di.PromptApp.CreatePrompt(c, &req)
	if err != nil {
		gx.JSONErr(c, err)
		return
	}
	gx.JSONSuccess(c, map[string]string{"id": id})
}

func UpdatePromptAPI(c *gin.Context) {
	var req appdto.UpdatePromptDraftReq
	if err := c.ShouldBindJSON(&req); err != nil {
		gx.JSONErr(c, gx.BErr(err))
		return
	}
	var uriReq struct {
		ID string `uri:"id" binding:"required"`
	}
	if err := c.ShouldBindUri(&uriReq); err != nil {
		gx.JSONErr(c, gx.BErr(err))
		return
	}
	req.ID = uriReq.ID
	err := di.PromptApp.UpdatePrompt(c, &req)
	if err != nil {
		gx.JSONErr(c, err)
		return
	}
	gx.JSONSuccess(c, nil)
}

func PublishPromptAPI(c *gin.Context) {
	var req appdto.PublishPromptReq
	var uriReq struct {
		ID string `uri:"id" binding:"required"`
	}
	if err := c.ShouldBindUri(&uriReq); err != nil {
		gx.JSONErr(c, gx.BErr(err))
		return
	}
	req.ID = uriReq.ID
	err := di.PromptApp.PublishPrompt(c, &req)
	if err != nil {
		gx.JSONErr(c, err)
		return
	}
	gx.JSONSuccess(c, nil)
}

func DeletePromptAPI(c *gin.Context) {
	var req appdto.DeletePromptReq
	if err := c.ShouldBindJSON(&req); err != nil {
		gx.JSONErr(c, gx.BErr(err))
		return
	}
	err := di.PromptApp.DeletePrompt(c, &req)
	if err != nil {
		gx.JSONErr(c, err)
		return
	}
	gx.JSONSuccess(c, nil)
}

func GetPromptAPI(c *gin.Context) {
	var req appdto.GetPromptReq
	if err := c.ShouldBindQuery(&req); err != nil {
		gx.JSONErr(c, gx.BErr(err))
		return
	}
	prompt, err := di.PromptApp.GetPrompt(c, &req)
	if err != nil {
		gx.JSONErr(c, err)
		return
	}
	gx.JSONSuccess(c, prompt)
}

func GetPromptArchivedListAPI(c *gin.Context) {
	var req struct {
		NamespaceID string `form:"namespace_id" binding:"required"`
		Name        string `form:"name" binding:"required"`
	}
	if err := c.ShouldBindQuery(&req); err != nil {
		gx.JSONErr(c, gx.BErr(err))
		return
	}
	prompts, err := di.PromptApp.GetPromptArchivedList(c, req.NamespaceID, req.Name)
	if err != nil {
		gx.JSONErr(c, err)
		return
	}
	gx.JSONSuccess(c, prompts)
}
