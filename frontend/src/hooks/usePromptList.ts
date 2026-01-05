import { useState, useCallback, useEffect } from 'react';
import { message } from 'antd';
import { 
  createPrompt, 
  deletePrompt, 
  getPromptList, 
  updatePrompt, 
  getPrompt, 
  publishPrompt, 
  Prompt, 
  CreatePromptRequest, 
  UpdatePromptRequest 
} from '@/apis/prompt';

export function usePromptList(namespaceId: string, filterName?: string) {
  const [loading, setLoading] = useState(false);
  const [prompts, setPrompts] = useState<Prompt[]>([]);

  const fetchPrompts = useCallback(async () => {
    if (!namespaceId) return;
    try {
      setLoading(true);
      const params: { name?: string; status?: string } = { status: 'draft' };
      if (filterName) params.name = filterName;
      const res = await getPromptList(namespaceId, params);
      setPrompts(res);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [namespaceId, filterName]);

  useEffect(() => {
    fetchPrompts();
  }, [fetchPrompts]);

  const handleDelete = useCallback(async (id: string) => {
    if (!namespaceId) return;
    try {
      await deletePrompt(namespaceId, id);
      message.success('删除成功');
      fetchPrompts();
    } catch (error) {
      message.error('删除失败');
    }
  }, [namespaceId, fetchPrompts]);

  const handleCreate = useCallback(async (values: CreatePromptRequest) => {
    if (!namespaceId) return;
    try {
      await createPrompt(namespaceId, values);
      message.success('创建成功');
      fetchPrompts();
      return true;
    } catch (error) {
      message.error('创建失败');
      return false;
    }
  }, [namespaceId, fetchPrompts]);

  const handleUpdate = useCallback(async (id: string, content: string) => {
    if (!namespaceId) return;
    try {
      await updatePrompt(namespaceId, id, { 
        id,
        content 
      });
      message.success('更新成功');
      fetchPrompts();
      return true;
    } catch (error) {
      message.error('更新失败');
      return false;
    }
  }, [namespaceId, fetchPrompts]);

  const handlePublish = useCallback(async (id: string, description?: string) => {
    if (!namespaceId) return;
    try {
      await publishPrompt(namespaceId, id, description);
      message.success('发布成功');
      fetchPrompts();
      return true;
    } catch (error) {
      message.error('发布失败');
      return false;
    }
  }, [namespaceId, fetchPrompts]);

  const loadPrompt = useCallback(async (id: string): Promise<Prompt | null> => {
    if (!namespaceId) return null;
    try {
      const data = await getPrompt(namespaceId, id);
      return data;
    } catch (error) {
      message.error('加载提示词失败');
      return null;
    }
  }, [namespaceId]);

  return {
    prompts,
    loading,
    fetchPrompts,
    handleDelete,
    handleCreate,
    handleUpdate,
    handlePublish,
    loadPrompt,
  };
}

