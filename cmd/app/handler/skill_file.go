package handler

import (
	"github.com/gin-gonic/gin"
	"github.com/xichan96/prompt-hub/internal/appdto"
	"github.com/xichan96/prompt-hub/internal/di"
	"github.com/xichan96/prompt-hub/pkg/web/gx"
)

func CreateSkillFileAPI(c *gin.Context) {
	var req appdto.CreateSkillFileReq
	if err := c.ShouldBindUri(&req); err != nil {
		gx.JSONErr(c, gx.BErr(err))
		return
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		gx.JSONErr(c, gx.BErr(err))
		return
	}
	id, err := di.SkillFileApp.CreateSkillFile(c, &req)
	if err != nil {
		gx.JSONErr(c, err)
		return
	}
	gx.JSONSuccess(c, map[string]string{"id": id})
}

func UpdateSkillFileAPI(c *gin.Context) {
	var req appdto.UpdateSkillFileReq
	if err := c.ShouldBindUri(&req); err != nil {
		gx.JSONErr(c, gx.BErr(err))
		return
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		gx.JSONErr(c, gx.BErr(err))
		return
	}
	if err := di.SkillFileApp.UpdateSkillFile(c, &req); err != nil {
		gx.JSONErr(c, err)
		return
	}
	gx.JSONSuccess(c, nil)
}

func DeleteSkillFileAPI(c *gin.Context) {
	var req appdto.DeleteSkillFileReq
	if err := c.ShouldBindUri(&req); err != nil {
		gx.JSONErr(c, gx.BErr(err))
		return
	}
	if err := di.SkillFileApp.DeleteSkillFile(c, &req); err != nil {
		gx.JSONErr(c, err)
		return
	}
	gx.JSONSuccess(c, nil)
}

func GetSkillFileAPI(c *gin.Context) {
	var req appdto.GetSkillFileReq
	if err := c.ShouldBindUri(&req); err != nil {
		gx.JSONErr(c, gx.BErr(err))
		return
	}
	if err := c.ShouldBindQuery(&req); err != nil {
		gx.JSONErr(c, gx.BErr(err))
		return
	}
	file, err := di.SkillFileApp.GetSkillFile(c, &req)
	if err != nil {
		gx.JSONErr(c, err)
		return
	}
	gx.JSONSuccess(c, file)
}

func GetSkillFileListAPI(c *gin.Context) {
	skillID := c.Param("skill_id")
	files, err := di.SkillFileApp.GetSkillFileList(c, skillID)
	if err != nil {
		gx.JSONErr(c, err)
		return
	}
	gx.JSONSuccess(c, files)
}
