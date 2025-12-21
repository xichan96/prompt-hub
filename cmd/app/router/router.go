package router

import (
	"github.com/gin-gonic/gin"

	"github.com/xichan96/prompt-hub/cmd/app/handler"
)

func RegisterAPIRouter(r *gin.Engine) {
	api := r.Group("/api")
	{
		users := api.Group("/users")
		{
			users.POST("", handler.CreateUserAPI)
			users.GET("", handler.GetUsersAPI)
			users.PUT("/:id", handler.UpdateUserAPI)
			users.DELETE("/:id", handler.DeleteUserAPI)
		}

		namespaces := api.Group("/namespaces")
		{
			namespaces.POST("", handler.CreateNamespaceAPI)
			namespaces.GET("", handler.GetNamespacesAPI)
			namespaces.PUT("/:id", handler.UpdateNamespaceAPI)
			namespaces.DELETE("/:id", handler.DeleteNamespaceAPI)

			namespaces.POST("/:namespace_id/prompts", handler.CreatePromptAPI)
		}

		prompts := api.Group("/prompts")
		{
			prompts.GET("", handler.GetPromptAPI)
			prompts.PUT("/:id", handler.UpdatePromptAPI)
			prompts.POST("/:id/publish", handler.PublishPromptAPI)
			prompts.DELETE("", handler.DeletePromptAPI)
			prompts.GET("/archived", handler.GetPromptArchivedListAPI)
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
