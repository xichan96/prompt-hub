import { request } from "@/utils";

export interface CreateSettingRequest {
  group: string;
  key: string;
  value: string;
}

export interface UpdateSettingRequest {
  group: string;
  key: string;
  value: string;
}

export interface DeleteSettingRequest {
  group: string;
  key: string;
}

export interface GetSettingRequest {
  group: string;
  key: string;
}

export interface Setting {
  group: string;
  key: string;
  value: string;
  created_at: string;
  updated_at: string;
}

export const createSetting = (data: CreateSettingRequest) => request.post('/settings', data);

export const updateSetting = (data: UpdateSettingRequest) => request.put('/settings', data);

export const deleteSetting = (data: DeleteSettingRequest) => request.delete('/settings', { data });

export const getSetting = (data: GetSettingRequest) => request.post<Setting>('/settings/get', data);

export const getSettings = (params?: { group?: string }) => request.get<Setting[]>('/settings', { params });

export interface LLMConfig {
  provider: string;
  openai: {
    api_key: string;
    base_url: string;
    model: string;
    org_id: string;
    api_type: string;
  };
  deepseek: {
    api_key: string;
    base_url: string;
    model: string;
  };
  volce: {
    api_key: string;
    base_url: string;
    model: string;
  };
}

export interface LLMSetting {
  provider: string;
  openai: {
    api_key: string;
    base_url: string;
    model: string;
    org_id: string;
    api_type: string;
  };
  deepseek: {
    api_key: string;
    base_url: string;
    model: string;
  };
  volce: {
    api_key: string;
    base_url: string;
    model: string;
  };
}

export interface UpdateLLMSettingRequest {
  provider: string;
  openai: {
    api_key: string;
    base_url: string;
    model: string;
    org_id: string;
    api_type: string;
  };
  deepseek: {
    api_key: string;
    base_url: string;
    model: string;
  };
  volce: {
    api_key: string;
    base_url: string;
    model: string;
  };
}

export const getLLMSetting = () => request.get<LLMSetting>('/settings/llm');

export const updateLLMSetting = (data: UpdateLLMSettingRequest) => request.put('/settings/llm', data);

export interface AgentConfig {
  name: string;
  prompt: string;
  tools: string[];
}

export interface AgentSetting {
  name: string;
  prompt: string;
  tools: string[];
}

export interface UpdateAgentSettingRequest {
  name: string;
  prompt: string;
  tools: string[];
}

export const getAgentSetting = () => request.get<AgentSetting>('/settings/agent');

export const updateAgentSetting = (data: UpdateAgentSettingRequest) => request.put('/settings/agent', data);

export interface SimpleMemoryConfig {
  max_history_messages: number;
}

export interface MongoDBMemoryConfig {
  uri: string;
  database: string;
  collection: string;
  max_history_messages: number;
}

export interface RedisMemoryConfig {
  host: string;
  port: number;
  username?: string;
  password?: string;
  db: number;
  key_prefix: string;
  max_history_messages: number;
}

export interface MemoryConfig {
  provider: string; // simple, mongodb, redis
  simple: SimpleMemoryConfig;
  mongodb: MongoDBMemoryConfig;
  redis: RedisMemoryConfig;
}

export interface MemorySetting {
  provider: string;
  simple: SimpleMemoryConfig;
  mongodb: MongoDBMemoryConfig;
  redis: RedisMemoryConfig;
}

export interface UpdateMemorySettingRequest {
  provider: string;
  simple: SimpleMemoryConfig;
  mongodb: MongoDBMemoryConfig;
  redis: RedisMemoryConfig;
}

export const getMemorySetting = () => request.get<MemorySetting>('/settings/memory');

export const updateMemorySetting = (data: UpdateMemorySettingRequest) => request.put('/settings/memory', data);

