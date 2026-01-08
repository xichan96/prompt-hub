package router

import (
	"github.com/gin-gonic/gin"

	"github.com/xichan96/prompt-hub/cmd/app/handler"
	"github.com/xichan96/prompt-hub/cmd/app/mcphandler"
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

		skills := api.Group("/skills", middleware.Auth())
		{
			skills.POST("", handler.CreateSkillAPI)
			skills.GET("", handler.GetSkillsAPI)
			skills.PUT("/:skill_id", handler.UpdateSkillAPI)
			skills.DELETE("/:skill_id", handler.DeleteSkillAPI)
			promptRouter := skills.Group("/:skill_id/prompts", middleware.SkillAccessMiddleware())
			{
				promptRouter.POST("", handler.CreatePromptAPI)
				promptRouter.GET("", handler.GetPromptListAPI)
				promptRouter.PUT("/:prompt_id", handler.UpdatePromptAPI)
				promptRouter.POST("/:prompt_id/publish", handler.PublishPromptAPI)
				promptRouter.DELETE("/:prompt_id", handler.DeletePromptAPI)
				promptRouter.GET("/:prompt_id", handler.GetPromptAPI)
			}

			fileRouter := skills.Group("/:skill_id/files", middleware.SkillAccessMiddleware())
			{
				fileRouter.POST("", handler.CreateSkillFileAPI)
				fileRouter.GET("", handler.GetSkillFileListAPI)
				fileRouter.PUT("/:file_id", handler.UpdateSkillFileAPI)
				fileRouter.DELETE("/:file_id", handler.DeleteSkillFileAPI)
				fileRouter.GET("/:file_id", handler.GetSkillFileAPI)
			}
		}

		settings := api.Group("/settings", middleware.Auth(), middleware.AdminRoleMiddleware())
		{
			settings.POST("", handler.CreateSettingAPI)
			settings.GET("", handler.GetSettingsAPI)
			settings.POST("/get", handler.GetSettingAPI)
			settings.PUT("", handler.UpdateSettingAPI)
			settings.DELETE("", handler.DeleteSettingAPI)
			settings.GET("/llm", handler.GetLLMSettingAPI)
			settings.PUT("/llm", handler.UpdateLLMSettingAPI)
			settings.GET("/agent", handler.GetAgentSettingAPI)
			settings.PUT("/agent", handler.UpdateAgentSettingAPI)
			settings.GET("/memory", handler.GetMemorySettingAPI)
			settings.PUT("/memory", handler.UpdateMemorySettingAPI)
		}

		agent := api.Group("/agent", middleware.Auth())
		{
			agent.POST("/session", handler.AgentSessionAPI)
			agent.POST("/chat", handler.AgentChatAPI)
			agent.POST("/chat/stream", handler.AgentStreamChatAPI)
		}
	}

	mcp := r.Group("/mcp")
	{
		h := mcphandler.NewMcpHandler()
		mcp.Any("/*path", gin.WrapH(h))
	}
}
