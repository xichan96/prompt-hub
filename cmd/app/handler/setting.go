package handler

import (
	"github.com/gin-gonic/gin"

	"github.com/xichan96/prompt-hub/internal/appdto"
	"github.com/xichan96/prompt-hub/internal/di"
	"github.com/xichan96/prompt-hub/pkg/web/gx"
)

// CreateSettingAPI       创建配置 godoc
// @Summary               创建配置
// @Description           创建新配置项
// @Tags                  配置管理
// @Accept                json
// @Produce               json
// @Param                 body    body        appdto.CreateSettingReq true    "配置信息"
// @Success               200     {object}    appdto.EmptyResponse         "创建成功"
// @Router                /api/settings [post]
func CreateSettingAPI(c *gin.Context) {
	var req appdto.CreateSettingReq
	if err := c.ShouldBindJSON(&req); err != nil {
		gx.JSONErr(c, gx.BErr(err))
		return
	}
	err := di.SettingApp.CreateSetting(c, &req)
	if err != nil {
		gx.JSONErr(c, err)
		return
	}
	gx.JSONSuccess(c, nil)
}

// GetMemorySettingAPI    获取Memory配置 godoc
// @Summary               获取Memory配置
// @Description           获取Memory配置信息
// @Tags                  配置管理
// @Accept                json
// @Produce               json
// @Success               200     {object}    appdto.MemorySetting  "获取成功"
// @Router                /api/settings/memory [get]
func GetMemorySettingAPI(c *gin.Context) {
	setting, err := di.SettingApp.GetMemorySetting(c)
	if err != nil {
		gx.JSONErr(c, err)
		return
	}
	gx.JSONSuccess(c, setting)
}

// UpdateMemorySettingAPI 更新Memory配置 godoc
// @Summary               更新Memory配置
// @Description           更新Memory配置信息
// @Tags                  配置管理
// @Accept                json
// @Produce               json
// @Param                 body    body        appdto.UpdateMemorySettingReq true    "Memory配置信息"
// @Success               200     {object}    appdto.EmptyResponse        "更新成功"
// @Router                /api/settings/memory [put]
func UpdateMemorySettingAPI(c *gin.Context) {
	var req appdto.UpdateMemorySettingReq
	if err := c.ShouldBindJSON(&req); err != nil {
		gx.JSONErr(c, gx.BErr(err))
		return
	}
	err := di.SettingApp.UpdateMemorySetting(c, &req)
	if err != nil {
		gx.JSONErr(c, err)
		return
	}
	gx.JSONSuccess(c, nil)
}

// UpdateSettingAPI       更新配置 godoc
// @Summary                更新配置
// @Description            更新配置项
// @Tags                   配置管理
// @Accept                 json
// @Produce                json
// @Param                  body    body        appdto.UpdateSettingReq true    "配置信息"
// @Success                200     {object}    appdto.EmptyResponse        "更新成功"
// @Router                 /api/settings [put]
func UpdateSettingAPI(c *gin.Context) {
	var req appdto.UpdateSettingReq
	if err := c.ShouldBindJSON(&req); err != nil {
		gx.JSONErr(c, gx.BErr(err))
		return
	}
	err := di.SettingApp.UpdateSetting(c, &req)
	if err != nil {
		gx.JSONErr(c, err)
		return
	}
	gx.JSONSuccess(c, nil)
}

// DeleteSettingAPI       删除配置 godoc
// @Summary               删除配置
// @Description           删除指定配置项
// @Tags                  配置管理
// @Accept                json
// @Produce               json
// @Param                 body    body        appdto.DeleteSettingReq true    "配置信息"
// @Success               200     {object}    appdto.EmptyResponse        "删除成功"
// @Router                /api/settings [delete]
func DeleteSettingAPI(c *gin.Context) {
	var req appdto.DeleteSettingReq
	if err := c.ShouldBindJSON(&req); err != nil {
		gx.JSONErr(c, gx.BErr(err))
		return
	}
	err := di.SettingApp.DeleteSetting(c, &req)
	if err != nil {
		gx.JSONErr(c, err)
		return
	}
	gx.JSONSuccess(c, nil)
}

// GetSettingAPI          获取配置 godoc
// @Summary               获取配置
// @Description           获取指定配置项
// @Tags                  配置管理
// @Accept                json
// @Produce               json
// @Param                 body    body        appdto.GetSettingReq true    "配置查询信息"
// @Success               200     {object}    appdto.SettingResponse  "获取成功"
// @Router                /api/settings/get [post]
func GetSettingAPI(c *gin.Context) {
	var req appdto.GetSettingReq
	if err := c.ShouldBindJSON(&req); err != nil {
		gx.JSONErr(c, gx.BErr(err))
		return
	}
	setting, err := di.SettingApp.GetSetting(c, &req)
	if err != nil {
		gx.JSONErr(c, err)
		return
	}
	gx.JSONSuccess(c, setting)
}

// GetSettingsAPI         获取配置列表 godoc
// @Summary               获取配置列表
// @Description           根据分组获取配置列表
// @Tags                  配置管理
// @Accept                json
// @Produce               json
// @Param                 group   query       string          false   "配置分组"
// @Success               200     {object}    appdto.SettingListResponse  "获取成功"
// @Router                /api/settings [get]
func GetSettingsAPI(c *gin.Context) {
	var req appdto.GetSettingsReq
	if err := c.ShouldBindQuery(&req); err != nil {
		gx.JSONErr(c, gx.BErr(err))
		return
	}
	settings, err := di.SettingApp.GetSettings(c, &req)
	if err != nil {
		gx.JSONErr(c, err)
		return
	}
	gx.JSONSuccess(c, settings)
}

// GetLLMSettingAPI       获取LLM配置 godoc
// @Summary               获取LLM配置
// @Description           获取LLM配置信息
// @Tags                  配置管理
// @Accept                json
// @Produce               json
// @Success               200     {object}    appdto.LLMSetting  "获取成功"
// @Router                /api/settings/llm [get]
func GetLLMSettingAPI(c *gin.Context) {
	setting, err := di.SettingApp.GetLLMSetting(c)
	if err != nil {
		gx.JSONErr(c, err)
		return
	}
	gx.JSONSuccess(c, setting)
}

// UpdateLLMSettingAPI    更新LLM配置 godoc
// @Summary               更新LLM配置
// @Description           更新LLM配置信息
// @Tags                  配置管理
// @Accept                json
// @Produce               json
// @Param                 body    body        appdto.UpdateLLMSettingReq true    "LLM配置信息"
// @Success               200     {object}    appdto.EmptyResponse        "更新成功"
// @Router                /api/settings/llm [put]
func UpdateLLMSettingAPI(c *gin.Context) {
	var req appdto.UpdateLLMSettingReq
	if err := c.ShouldBindJSON(&req); err != nil {
		gx.JSONErr(c, gx.BErr(err))
		return
	}
	err := di.SettingApp.UpdateLLMSetting(c, &req)
	if err != nil {
		gx.JSONErr(c, err)
		return
	}
	gx.JSONSuccess(c, nil)
}

// GetAgentSettingAPI     获取Agent配置 godoc
// @Summary               获取Agent配置
// @Description           获取Agent配置信息
// @Tags                  配置管理
// @Accept                json
// @Produce               json
// @Success               200     {object}    appdto.AgentSetting  "获取成功"
// @Router                /api/settings/agent [get]
func GetAgentSettingAPI(c *gin.Context) {
	setting, err := di.SettingApp.GetAgentSetting(c)
	if err != nil {
		gx.JSONErr(c, err)
		return
	}
	gx.JSONSuccess(c, setting)
}

// UpdateAgentSettingAPI  更新Agent配置 godoc
// @Summary               更新Agent配置
// @Description           更新Agent配置信息
// @Tags                  配置管理
// @Accept                json
// @Produce               json
// @Param                 body    body        appdto.UpdateAgentSettingReq true    "Agent配置信息"
// @Success               200     {object}    appdto.EmptyResponse        "更新成功"
// @Router                /api/settings/agent [put]
func UpdateAgentSettingAPI(c *gin.Context) {
	var req appdto.UpdateAgentSettingReq
	if err := c.ShouldBindJSON(&req); err != nil {
		gx.JSONErr(c, gx.BErr(err))
		return
	}
	err := di.SettingApp.UpdateAgentSetting(c, &req)
	if err != nil {
		gx.JSONErr(c, err)
		return
	}
	gx.JSONSuccess(c, nil)
}
