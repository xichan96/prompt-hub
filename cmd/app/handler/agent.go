package handler

import (
	"bytes"
	"encoding/json"
	"errors"
	"io"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/xichan96/cortex/trigger/http"
	"github.com/xichan96/prompt-hub/internal/di"
	"github.com/xichan96/prompt-hub/pkg/web"
	"github.com/xichan96/prompt-hub/pkg/web/gx"
)

type agentChatRequest struct {
	Message   string `json:"message" binding:"required"`
	SessionID string `json:"session_id"`
}

// AgentChatAPI        Agent聊天接口 godoc
// @Summary            Agent聊天接口
// @Description        与Agent进行对话交互
// @Tags               Agent管理
// @Accept             json
// @Produce            json
// @Param              body    body        object  true    "聊天请求"  example({"message":"你好","session_id":"session_123"})
// @Success            200     {object}    web.ResponseBody  "聊天成功"
// @Router             /api/agent/chat [post]
func AgentChatAPI(c *gin.Context) {
	var reqBody agentChatRequest
	if err := c.ShouldBindBodyWithJSON(&reqBody); err != nil {
		gx.JSONErr(c, gx.BErr(err))
		return
	}

	if reqBody.SessionID == "" {
		reqBody.SessionID = uuid.New().String()
	}

	httpHandler := http.NewHandler()
	req, err := httpHandler.GetMessageRequest(c)
	if err != nil {
		gx.JSONErr(c, err)
		return
	}

	req.SessionID = reqBody.SessionID
	req.Message = reqBody.Message

	engine, err := di.AgentApp.Engine(req.SessionID)
	if err != nil {
		gx.JSONErr(c, err)
		return
	}

	blw := &bodyLogWriter{body: bytes.NewBufferString(""), ResponseWriter: c.Writer, sessionID: reqBody.SessionID}
	c.Writer = blw

	httpHandler.ChatAPI(c, engine, req)
}

type bodyLogWriter struct {
	gin.ResponseWriter
	body        *bytes.Buffer
	sessionID   string
	intercepted bool
}

func (w *bodyLogWriter) Write(b []byte) (int, error) {
	if !w.intercepted && w.Status() == 200 {
		w.body.Write(b)
		var resp web.ResponseBody
		if err := json.Unmarshal(b, &resp); err == nil {
			w.intercepted = true
			if resp.Data != nil {
				if dataMap, ok := resp.Data.(map[string]interface{}); ok {
					dataMap["session_id"] = w.sessionID
					resp.Data = dataMap
				} else {
					resp.Data = map[string]interface{}{
						"content":    resp.Data,
						"session_id": w.sessionID,
					}
				}
			} else {
				resp.Data = map[string]interface{}{
					"session_id": w.sessionID,
				}
			}
			modifiedData, _ := json.Marshal(resp)
			return w.ResponseWriter.Write(modifiedData)
		}
	}
	return w.ResponseWriter.Write(b)
}

func (w *bodyLogWriter) WriteString(s string) (int, error) {
	return w.Write([]byte(s))
}

// AgentSessionAPI      获取Agent会话ID godoc
// @Summary            获取Agent会话ID
// @Description        获取新的会话ID用于Agent对话
// @Tags               Agent管理
// @Produce            json
// @Success            200     {object}    web.ResponseBody  "获取成功"
// @Router             /api/agent/session [post]
func AgentSessionAPI(c *gin.Context) {
	sessionID := uuid.New().String()
	gx.JSONSuccess(c, map[string]string{
		"session_id": sessionID,
	})
}

// AgentStreamChatAPI  Agent流式聊天接口 godoc
// @Summary            Agent流式聊天接口
// @Description        与Agent进行流式对话交互
// @Tags               Agent管理
// @Accept             json
// @Produce            json
// @Param              body    body        object  true    "聊天请求"  example({"message":"你好","session_id":"session_123"})
// @Success            200     {object}    web.ResponseBody  "流式聊天成功"
// @Router             /api/agent/chat/stream [post]
func AgentStreamChatAPI(c *gin.Context) {
	bodyBytes, err := io.ReadAll(c.Request.Body)
	if err != nil {
		gx.JSONErr(c, gx.BErr(err))
		return
	}
	c.Request.Body = io.NopCloser(bytes.NewBuffer(bodyBytes))

	var reqBody agentChatRequest
	if err := json.Unmarshal(bodyBytes, &reqBody); err != nil {
		gx.JSONErr(c, gx.BErr(err))
		return
	}

	if reqBody.Message == "" {
		gx.JSONErr(c, gx.BErr(errors.New("message is required")))
		return
	}

	if reqBody.SessionID == "" {
		reqBody.SessionID = uuid.New().String()
	}

	c.Request.Body = io.NopCloser(bytes.NewBuffer(bodyBytes))

	httpHandler := http.NewHandler()
	req, err := httpHandler.GetMessageRequest(c)
	if err != nil {
		gx.JSONErr(c, err)
		return
	}

	req.SessionID = reqBody.SessionID
	req.Message = reqBody.Message

	engine, err := di.AgentApp.Engine(req.SessionID)
	if err != nil {
		gx.JSONErr(c, err)
		return
	}
	httpHandler.StreamChatAPI(c, engine, req)
}
