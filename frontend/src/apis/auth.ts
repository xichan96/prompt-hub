import { request } from "@/utils";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export type UserRole = 'admin' | 'user';

export interface UserInfo {
  id: string;
  username: string;
  role: UserRole;
  created_at?: string;
  updated_at?: string;
}

export const login = (data: LoginRequest) => request.post<LoginResponse>('/login', data);

export const logout = () => Promise.resolve();

