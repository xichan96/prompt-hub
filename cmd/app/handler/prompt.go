package handler

import (
	"github.com/gin-gonic/gin"
	"github.com/xichan96/prompt-hub/pkg/web/gx"

	"github.com/xichan96/prompt-hub/internal/appdto"
	"github.com/xichan96/prompt-hub/internal/di"
)

// CreatePromptAPI       创建提示词 godoc
// @Summary               创建提示词
// @Description           在指定命名空间下创建新提示词
// @Tags                  提示词管理
// @Accept                json
// @Produce               json
// @Param                 namespace_id    path        string                  true    "命名空间ID"
// @Param                 body            body        appdto.CreatePromptDraftReq true    "提示词信息"
// @Success               200             {object}    appdto.CreateIDResponse  "创建成功"
// @Router                /api/namespaces/:namespace_id/prompts [post]
func CreatePromptAPI(c *gin.Context) {
	var req appdto.CreatePromptDraftReq
	if err := c.ShouldBindUri(&req); err != nil {
		gx.JSONErr(c, gx.BErr(err))
		return
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		gx.JSONErr(c, gx.BErr(err))
		return
	}
	id, err := di.PromptApp.CreatePrompt(c, &req)
	if err != nil {
		gx.JSONErr(c, err)
		return
	}
	gx.JSONSuccess(c, map[string]string{"id": id})
}

// UpdatePromptAPI       更新提示词 godoc
// @Summary               更新提示词
// @Description           更新提示词信息
// @Tags                  提示词管理
// @Accept                json
// @Produce               json
// @Param                 namespace_id    path        string                  true    "命名空间ID"
// @Param                 prompt_id        path        string                  true    "提示词ID"
// @Param                 body            body        appdto.UpdatePromptDraftReq true    "提示词信息"
// @Success               200             {object}    appdto.EmptyResponse         "更新成功"
// @Router                /api/namespaces/:namespace_id/prompts/:prompt_id [put]
func UpdatePromptAPI(c *gin.Context) {
	var req appdto.UpdatePromptDraftReq
	if err := c.ShouldBindUri(&req); err != nil {
		gx.JSONErr(c, gx.BErr(err))
		return
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		gx.JSONErr(c, gx.BErr(err))
		return
	}
	err := di.PromptApp.UpdatePrompt(c, &req)
	if err != nil {
		gx.JSONErr(c, err)
		return
	}
	gx.JSONSuccess(c, nil)
}

// PublishPromptAPI      发布提示词 godoc
// @Summary               发布提示词
// @Description           发布指定提示词
// @Tags                  提示词管理
// @Accept                json
// @Produce               json
// @Param                 namespace_id    path        string                  true    "命名空间ID"
// @Param                 prompt_id       path        string                  true    "提示词ID"
// @Param                 body            body        appdto.PublishPromptReq  true    "发布信息"
// @Success               200             {object}    appdto.EmptyResponse "发布成功"
// @Router                /api/namespaces/:namespace_id/prompts/:prompt_id/publish [post]
func PublishPromptAPI(c *gin.Context) {
	var req appdto.PublishPromptReq
	if err := c.ShouldBindUri(&req); err != nil {
		gx.JSONErr(c, gx.BErr(err))
		return
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		gx.JSONErr(c, gx.BErr(err))
		return
	}
	err := di.PromptApp.PublishPrompt(c, &req)
	if err != nil {
		gx.JSONErr(c, err)
		return
	}
	gx.JSONSuccess(c, nil)
}

// DeletePromptAPI       删除提示词 godoc
// @Summary               删除提示词
// @Description           删除指定提示词
// @Tags                  提示词管理
// @Accept                json
// @Produce               json
// @Param                 namespace_id    path        string          true    "命名空间ID"
// @Param                 prompt_id        path        string          true    "提示词ID"
// @Success               200             {object}    appdto.EmptyResponse         "删除成功"
// @Router                /api/namespaces/:namespace_id/prompts/:prompt_id [delete]
func DeletePromptAPI(c *gin.Context) {
	var req appdto.DeletePromptReq
	if err := c.ShouldBindUri(&req); err != nil {
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

// GetPromptAPI          获取提示词 godoc
// @Summary               获取提示词
// @Description           根据ID获取提示词
// @Tags                  提示词管理
// @Accept                json
// @Produce               json
// @Param                 namespace_id    path        string          true    "命名空间ID"
// @Param                 prompt_id        path        string          true    "提示词ID"
// @Success               200             {object}    appdto.PromptResponse  "获取成功"
// @Router                /api/namespaces/:namespace_id/prompts/:prompt_id [get]
func GetPromptAPI(c *gin.Context) {
	var req appdto.GetPromptReq
	if err := c.ShouldBindUri(&req); err != nil {
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

// GetPromptListAPI   获取提示词列表 godoc
// @Summary                     获取提示词列表
// @Description                 获取指定命名空间和名称下的提示词列表
// @Tags                        提示词管理
// @Accept                      json
// @Produce                     json
// @Param                       namespace_id    path        string          true    "命名空间ID"
// @Param                       name            query       string          false   "提示词名称"
// @Param                       status          query       string          false   "状态"
// @Success                     200             {object}    appdto.PromptListResponse  "获取成功"
// @Router                      /api/namespaces/:namespace_id/prompts [get]
func GetPromptListAPI(c *gin.Context) {
	var req appdto.GetPromptReq
	if err := c.ShouldBindUri(&req); err != nil {
		gx.JSONErr(c, gx.BErr(err))
		return
	}
	if err := c.ShouldBindQuery(&req); err != nil {
		gx.JSONErr(c, gx.BErr(err))
		return
	}
	prompts, err := di.PromptApp.GetPromptList(c, req.NamespaceID, req.Name, req.Status)
	if err != nil {
		gx.JSONErr(c, err)
		return
	}
	gx.JSONSuccess(c, prompts)
}
