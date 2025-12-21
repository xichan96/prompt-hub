package handler

import (
	"github.com/gin-gonic/gin"

	"github.com/xichan96/prompt-hub/internal/appdto"
	"github.com/xichan96/prompt-hub/internal/di"
	"github.com/xichan96/prompt-hub/pkg/web/gx"
)

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
