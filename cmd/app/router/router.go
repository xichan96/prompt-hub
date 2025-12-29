package router

import (
	"github.com/gin-gonic/gin"

	"github.com/xichan96/prompt-hub/cmd/app/handler"
)

func RegisterAPIRouter(r *gin.Engine) {
	api := r.Group("/api")
	{
		api.POST("/login", handler.LoginAPI)

		users := api.Group("/users")
		{
			users.POST("", handler.CreateUserAPI)
			users.GET("", handler.GetUsersAPI)
			users.PUT("/:user_id", handler.UpdateUserAPI)
			users.DELETE("/:user_id", handler.DeleteUserAPI)
		}

		namespaces := api.Group("/namespaces")
		{
			namespaces.POST("", handler.CreateNamespaceAPI)
			namespaces.GET("", handler.GetNamespacesAPI)
			namespaces.PUT("/:namespace_id", handler.UpdateNamespaceAPI)
			namespaces.DELETE("/:namespace_id", handler.DeleteNamespaceAPI)
			promptRouter := namespaces.Group("/:namespace_id/prompts")
			{
				promptRouter.POST("", handler.CreatePromptAPI)
				promptRouter.GET("", handler.GetPromptListAPI)
				promptRouter.PUT("/:prompt_id", handler.UpdatePromptAPI)
				promptRouter.POST("/:prompt_id/publish", handler.PublishPromptAPI)
				promptRouter.DELETE("/:prompt_id", handler.DeletePromptAPI)
				promptRouter.GET("/:prompt_id", handler.GetPromptAPI)
			}
		}

		settings := api.Group("/settings")
		{
			settings.POST("", handler.CreateSettingAPI)
			settings.GET("", handler.GetSettingsAPI)
			settings.POST("/get", handler.GetSettingAPI)
			settings.PUT("", handler.UpdateSettingAPI)
			settings.DELETE("", handler.DeleteSettingAPI)
		}
	}
}
