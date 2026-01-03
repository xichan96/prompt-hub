import { request } from "@/utils";

export interface CreateUserRequest {
  username: string;
  password: string;
  role: string;
}

export interface UpdateUserRequest {
  id: string;
  username?: string;
  password?: string;
  role?: string;
}

export interface User {
  id: string;
  username: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export const createUser = (data: CreateUserRequest) => request.post<{ id: string }>('/users', data);

export const updateUser = (userId: string, data: UpdateUserRequest) => request.put(`/users/${userId}`, data);

export const deleteUser = (userId: string) => request.delete(`/users/${userId}`);

export const getUsers = () => request.get<User[]>('/users');

