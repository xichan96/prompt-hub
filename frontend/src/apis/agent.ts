import { request } from "@/utils";

export interface AgentMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface AgentChatRequest {
  session_id?: string;
  message: string;
}

export interface AgentChatResponse {
  content: string;
  session_id?: string;
}

export interface AgentSessionResponse {
  session_id: string;
}

export const getAgentSession = () =>
  request.post<AgentSessionResponse>("/agent/session");

export const agentChat = (data: AgentChatRequest) =>
  request.post<AgentChatResponse>("/agent/chat", data);

export const agentStreamChat = (data: AgentChatRequest) =>
  request.post("/agent/chat/stream", data, {
    responseType: "text",
  });

