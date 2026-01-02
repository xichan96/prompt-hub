package router

import (
	"github.com/gin-gonic/gin"

	"github.com/xichan96/prompt-hub/cmd/app/handler"
	"github.com/xichan96/prompt-hub/cmd/app/middleware"
)

func RegisterAPIRouter(r *gin.Engine) {
	api := r.Group("/api")
	{
		api.POST("/login", handler.LoginAPI)

		users := api.Group("/users", middleware.Auth())
		{
			users.POST("", middleware.AdminRoleMiddleware(), handler.CreateUserAPI)
			users.GET("", middleware.AdminRoleMiddleware(), handler.GetUsersAPI)
			users.PUT("/:user_id", handler.UpdateUserAPI)
			users.DELETE("/:user_id", middleware.AdminRoleMiddleware(), handler.DeleteUserAPI)
		}

		namespaces := api.Group("/namespaces", middleware.Auth())
		{
			namespaces.POST("", handler.CreateNamespaceAPI)
			namespaces.GET("", handler.GetNamespacesAPI)
			namespaces.PUT("/:namespace_id", handler.UpdateNamespaceAPI)
			namespaces.DELETE("/:namespace_id", handler.DeleteNamespaceAPI)
			promptRouter := namespaces.Group("/:namespace_id/prompts", middleware.NamespaceAccessMiddleware())
			{
				promptRouter.POST("", handler.CreatePromptAPI)
				promptRouter.GET("", handler.GetPromptListAPI)
				promptRouter.PUT("/:prompt_id", handler.UpdatePromptAPI)
				promptRouter.POST("/:prompt_id/publish", handler.PublishPromptAPI)
				promptRouter.DELETE("/:prompt_id", handler.DeletePromptAPI)
				promptRouter.GET("/:prompt_id", handler.GetPromptAPI)
			}
		}

		settings := api.Group("/settings", middleware.Auth(), middleware.AdminRoleMiddleware())
		{
			settings.POST("", handler.CreateSettingAPI)
			settings.GET("", handler.GetSettingsAPI)
			settings.POST("/get", handler.GetSettingAPI)
			settings.PUT("", handler.UpdateSettingAPI)
			settings.DELETE("", handler.DeleteSettingAPI)
		}
	}
}
