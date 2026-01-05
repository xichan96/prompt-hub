import { request } from "@/utils";

export interface CreatePromptRequest {
  name: string;
  description?: string;
  content: string;
}

export interface UpdatePromptRequest {
  id: string;
  description?: string;
  content?: string;
}

export interface Prompt {
  id: string;
  namespace_id: string;
  name: string;
  description: string;
  content: string;
  status: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export const createPrompt = (namespaceId: string, data: CreatePromptRequest) => 
  request.post<{ id: string }>(`/namespaces/${namespaceId}/prompts`, data);

export const updatePrompt = (namespaceId: string, promptId: string, data: UpdatePromptRequest) => 
  request.put(`/namespaces/${namespaceId}/prompts/${promptId}`, data);

export const deletePrompt = (namespaceId: string, promptId: string) => 
  request.delete(`/namespaces/${namespaceId}/prompts/${promptId}`);

export const getPrompt = (namespaceId: string, promptId: string) => 
  request.get<Prompt>(`/namespaces/${namespaceId}/prompts/${promptId}`);

export const getPromptList = (namespaceId: string, params?: { name?: string; status?: string }) => 
  request.get<Prompt[]>(`/namespaces/${namespaceId}/prompts`, { params });

export const publishPrompt = (namespaceId: string, promptId: string, description?: string) => 
  request.post(`/namespaces/${namespaceId}/prompts/${promptId}/publish`, { description });

