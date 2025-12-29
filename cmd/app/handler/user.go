package handler

import (
	"github.com/gin-gonic/gin"

	"github.com/xichan96/prompt-hub/internal/appdto"
	"github.com/xichan96/prompt-hub/internal/di"
	"github.com/xichan96/prompt-hub/pkg/web/gx"
)

// CreateUserAPI    创建用户 godoc
// @Summary         创建用户
// @Description     创建新用户
// @Tags            用户管理
// @Accept          json
// @Produce         json
// @Param           body    body        appdto.CreateUserReq true    "用户信息"
// @Success         200     {object}    appdto.CreateIDResponse  "创建成功"
// @Router          /api/users [post]
func CreateUserAPI(c *gin.Context) {
	var req appdto.CreateUserReq
	if err := c.ShouldBindJSON(&req); err != nil {
		gx.JSONErr(c, gx.BErr(err))
		return
	}
	id, err := di.UserApp.CreateUser(c, &req)
	if err != nil {
		gx.JSONErr(c, err)
		return
	}
	gx.JSONSuccess(c, map[string]string{"id": id})
}

// UpdateUserAPI    更新用户 godoc
// @Summary         更新用户
// @Description     更新用户信息
// @Tags            用户管理
// @Accept          json
// @Produce         json
// @Param           id      path        string              true    "用户ID"
// @Param           body    body        appdto.UpdateUserReq true    "用户信息"
// @Success         200     {object}    appdto.EmptyResponse     "更新成功"
// @Router          /api/users/:id [put]
func UpdateUserAPI(c *gin.Context) {
	var req appdto.UpdateUserReq
	if err := c.ShouldBindJSON(&req); err != nil {
		gx.JSONErr(c, gx.BErr(err))
		return
	}
	err := di.UserApp.UpdateUser(c, &req)
	if err != nil {
		gx.JSONErr(c, err)
		return
	}
	gx.JSONSuccess(c, nil)
}

// DeleteUserAPI    删除用户 godoc
// @Summary         删除用户
// @Description     删除指定用户
// @Tags            用户管理
// @Accept          json
// @Produce         json
// @Param           id      path        string          true    "用户ID"
// @Success         200     {object}    appdto.EmptyResponse "删除成功"
// @Router          /api/users/:id [delete]
func DeleteUserAPI(c *gin.Context) {
	var req struct {
		ID string `uri:"user_id" binding:"required"`
	}
	if err := c.ShouldBindUri(&req); err != nil {
		gx.JSONErr(c, gx.BErr(err))
		return
	}
	err := di.UserApp.DeleteUser(c, req.ID)
	if err != nil {
		gx.JSONErr(c, err)
		return
	}
	gx.JSONSuccess(c, nil)
}

// GetUsersAPI     获取用户列表 godoc
// @Summary         获取用户列表
// @Description     获取所有用户列表
// @Tags            用户管理
// @Accept          json
// @Produce         json
// @Success         200     {object}    appdto.UserListResponse  "获取成功"
// @Router          /api/users [get]
func GetUsersAPI(c *gin.Context) {
	users, err := di.UserApp.GetUsers(c)
	if err != nil {
		gx.JSONErr(c, err)
		return
	}
	gx.JSONSuccess(c, users)
}

// LoginAPI    用户登录 godoc
// @Summary         用户登录
// @Description     用户账号密码登录
// @Tags            用户管理
// @Accept          json
// @Produce         json
// @Param           body    body        appdto.LoginRequest true    "登录信息"
// @Success         200     {object}    appdto.LoginResponse  "登录成功"
// @Router          /api/login [post]
func LoginAPI(c *gin.Context) {
	var req appdto.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		gx.JSONErr(c, gx.BErr(err))
		return
	}
	resp, err := di.UserApp.LoginWithPassword(c, &req)
	if err != nil {
		gx.JSONErr(c, err)
		return
	}
	gx.JSONSuccess(c, resp)
}
