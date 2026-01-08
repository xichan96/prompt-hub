package middleware

import (
	"github.com/gin-gonic/gin"
	"github.com/xichan96/prompt-hub/internal/infra/persist"
	"github.com/xichan96/prompt-hub/pkg/ec"
	"github.com/xichan96/prompt-hub/pkg/web/cctx"
	"github.com/xichan96/prompt-hub/pkg/web/gx"
)

func SkillAccessMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		skillID := c.Param("skill_id")
		if len(skillID) == 0 {
			c.Abort()
			gx.JSONErr(c, ec.BadParams)
			return
		}

		userRole := cctx.GetUserRole[string](c)
		if userRole == AdminRole {
			c.Next()
			return
		}

		userID := cctx.GetUserID[string](c)
		nps := persist.NewSkillPersist()
		skill, err := nps.GetByID(c, skillID)
		if err != nil {
			c.Abort()
			gx.JSONErr(c, ec.NoFound)
			return
		}

		if skill.CreatedBy != userID {
			c.Abort()
			gx.JSONErr(c, ec.Forbidden)
			return
		}

		c.Next()
	}
}
