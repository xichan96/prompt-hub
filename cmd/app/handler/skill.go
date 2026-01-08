package handler

import (
	"github.com/gin-gonic/gin"
	"github.com/xichan96/prompt-hub/pkg/web/gx"

	"github.com/xichan96/prompt-hub/internal/appdto"
	"github.com/xichan96/prompt-hub/internal/di"
)

// CreateSkillAPI    创建技能 godoc
// @Summary               创建技能
// @Description           创建新技能
// @Tags                  技能管理
// @Accept                json
// @Produce               json
// @Param                 body    body        appdto.CreateSkillReq true    "技能信息"
// @Success               200     {object}    appdto.CreateIDResponse  "创建成功"
// @Router                /api/skills [post]
func CreateSkillAPI(c *gin.Context) {
	var req appdto.CreateSkillReq
	if err := c.ShouldBindJSON(&req); err != nil {
		gx.JSONErr(c, gx.BErr(err))
		return
	}
	id, err := di.SkillApp.CreateSkill(c, &req)
	if err != nil {
		gx.JSONErr(c, err)
		return
	}
	gx.JSONSuccess(c, map[string]string{"id": id})
}

// UpdateSkillAPI    更新技能 godoc
// @Summary               更新技能
// @Description           更新技能信息
// @Tags                  技能管理
// @Accept                json
// @Produce               json
// @Param                 skill_id      path        string                  true    "技能ID"
// @Param                 body    body        appdto.UpdateSkillReq true    "技能信息"
// @Success               200     {object}    appdto.EmptyResponse         "更新成功"
// @Router                /api/skills/:skill_id [put]
func UpdateSkillAPI(c *gin.Context) {
	var req appdto.UpdateSkillReq
	if err := c.ShouldBindUri(&req); err != nil {
		gx.JSONErr(c, gx.BErr(err))
		return
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		gx.JSONErr(c, gx.BErr(err))
		return
	}
	err := di.SkillApp.UpdateSkill(c, &req)
	if err != nil {
		gx.JSONErr(c, err)
		return
	}
	gx.JSONSuccess(c, nil)
}

// DeleteSkillAPI    删除技能 godoc
// @Summary               删除技能
// @Description           删除指定技能
// @Tags                  技能管理
// @Accept                json
// @Produce               json
// @Param                 skill_id      path        string          true    "技能ID"
// @Success               200     {object}    appdto.EmptyResponse "删除成功"
// @Router                /api/skills/:skill_id [delete]
func DeleteSkillAPI(c *gin.Context) {
	var req appdto.UpdateSkillReq
	if err := c.ShouldBindUri(&req); err != nil {
		gx.JSONErr(c, gx.BErr(err))
		return
	}
	err := di.SkillApp.DeleteSkill(c, req.ID)
	if err != nil {
		gx.JSONErr(c, err)
		return
	}
	gx.JSONSuccess(c, nil)
}

// GetSkillsAPI      获取技能列表 godoc
// @Summary               获取技能列表
// @Description           获取所有技能列表
// @Tags                  技能管理
// @Accept                json
// @Produce               json
// @Success               200     {object}    appdto.SkillListResponse  "获取成功"
// @Router                /api/skills [get]
func GetSkillsAPI(c *gin.Context) {
	skills, err := di.SkillApp.GetSkills(c)
	if err != nil {
		gx.JSONErr(c, err)
		return
	}
	gx.JSONSuccess(c, skills)
}
