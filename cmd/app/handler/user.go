package handler

import (
	"github.com/gin-gonic/gin"

	"github.com/xichan96/prompt-hub/internal/appdto"
	"github.com/xichan96/prompt-hub/internal/di"
	"github.com/xichan96/prompt-hub/pkg/web/gx"
)

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

func DeleteUserAPI(c *gin.Context) {
	var req struct {
		ID string `uri:"id" binding:"required"`
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

func GetUsersAPI(c *gin.Context) {
	users, err := di.UserApp.GetUsers(c)
	if err != nil {
		gx.JSONErr(c, err)
		return
	}
	gx.JSONSuccess(c, users)
}
