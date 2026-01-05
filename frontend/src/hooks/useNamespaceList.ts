import { useState, useCallback, useEffect } from 'react';
import { message } from 'antd';
import { 
  createNamespace, 
  deleteNamespace, 
  getNamespaces, 
  updateNamespace, 
  Namespace, 
  CreateNamespaceRequest, 
  UpdateNamespaceRequest 
} from '@/apis/namespace';

export function useNamespaceList() {
  const [loading, setLoading] = useState(false);
  const [namespaces, setNamespaces] = useState<Namespace[]>([]);

  const fetchNamespaces = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getNamespaces();
      setNamespaces(res);
      return res;
    } catch (error) {
      console.error(error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNamespaces();
  }, [fetchNamespaces]);

  const handleDelete = useCallback(async (id: string) => {
    try {
      await deleteNamespace(id);
      message.success('删除成功');
      fetchNamespaces();
    } catch (error) {
      message.error('删除失败');
    }
  }, [fetchNamespaces]);

  const handleCreate = useCallback(async (values: CreateNamespaceRequest) => {
    try {
      await createNamespace(values);
      message.success('创建成功');
      fetchNamespaces();
      return true;
    } catch (error) {
      message.error('创建失败');
      return false;
    }
  }, [fetchNamespaces]);

  const handleUpdate = useCallback(async (id: string, values: UpdateNamespaceRequest) => {
    try {
      await updateNamespace(id, { ...values, id });
      message.success('更新成功');
      fetchNamespaces();
      return true;
    } catch (error) {
      message.error('更新失败');
      return false;
    }
  }, [fetchNamespaces]);

  return {
    namespaces,
    loading,
    fetchNamespaces,
    handleDelete,
    handleCreate,
    handleUpdate,
  };
}

