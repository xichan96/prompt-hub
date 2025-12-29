package middleware

import (
	"github.com/gin-gonic/gin"
	"github.com/xichan96/prompt-hub/pkg/ec"
	"github.com/xichan96/prompt-hub/pkg/web/cctx"
	"github.com/xichan96/prompt-hub/pkg/web/gx"
	"github.com/xichan96/prompt-hub/pkg/web/jwt"
)

func Auth() gin.HandlerFunc {
	return func(c *gin.Context) {
		token := c.GetHeader("X-JWT")
		if len(token) == 0 {
			c.Abort()
			gx.JSONErr(c, ec.Unauthorized)
			return
		}

		var userData map[string]interface{}
		if err := jwt.DefaultToken.DecodeBody(token, &userData); err != nil {
			c.Abort()
			gx.JSONErr(c, ec.Unauthorized)
			return
		}

		if id, ok := userData["id"].(string); ok {
			cctx.SetUserID(c, id)
		}
		if username, ok := userData["username"].(string); ok {
			cctx.SetUsername(c, username)
		}
		if role, ok := userData["role"].(string); ok {
			cctx.SetUserRole(c, role)
		}
	}
}
