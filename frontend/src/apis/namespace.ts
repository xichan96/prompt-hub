import { request } from "@/utils";

export interface CreateNamespaceRequest {
  name: string;
  description?: string;
}

export interface UpdateNamespaceRequest {
  id: string;
  name?: string;
  description?: string;
}

export interface Namespace {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export const createNamespace = (data: CreateNamespaceRequest) => request.post<{ id: string }>('/namespaces', data);

export const updateNamespace = (namespaceId: string, data: UpdateNamespaceRequest) => request.put(`/namespaces/${namespaceId}`, data);

export const deleteNamespace = (namespaceId: string) => request.delete(`/namespaces/${namespaceId}`);

export const getNamespaces = () => request.get<Namespace[]>('/namespaces');

