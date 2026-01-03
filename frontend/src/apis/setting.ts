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

