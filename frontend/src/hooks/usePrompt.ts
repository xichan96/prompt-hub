import { useState, useCallback } from 'react';
import { message } from 'antd';
import { publishPrompt, updatePrompt, getPrompt, getPromptList, Prompt } from '@/apis/prompt';

export function usePromptOperations(namespaceId: string, promptId?: string) {
  const [publishing, setPublishing] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = useCallback(async (content: string, showSuccessMessage = true) => {
    if (!namespaceId || !promptId) return;
    try {
      setSaving(true);
      await updatePrompt(namespaceId, promptId, {
        id: promptId,
        content: content
      });
      if (showSuccessMessage) {
        message.success('保存成功');
      }
      return true;
    } catch (error) {
      return false;
    } finally {
      setSaving(false);
    }
  }, [namespaceId, promptId]);

  const handlePublish = useCallback(async (description?: string) => {
    if (!namespaceId || !promptId) return;
    try {
      setPublishing(true);
      await publishPrompt(namespaceId, promptId, description);
      message.success('发布成功');
      return true;
    } catch (error) {
      return false;
    } finally {
      setPublishing(false);
    }
  }, [namespaceId, promptId]);

  return {
    publishing,
    saving,
    handleSave,
    handlePublish,
  };
}

export function usePromptVersions(namespaceId: string, promptName?: string) {
  const [publishedContent, setPublishedContent] = useState<string>('');
  const [hasPublished, setHasPublished] = useState(false);
  const [loadingDiff, setLoadingDiff] = useState(false);
  const [draftContent, setDraftContent] = useState<string>('');
  const lastFetchKeyRef = useState<{ key: string }>(() => ({ key: '' }))[0];

  const loadPublishedContent = useCallback(async (opts?: { force?: boolean }) => {
    if (!namespaceId || !promptName) return;
    try {
      const fetchKey = `${namespaceId}|${promptName}`;
      if (!opts?.force && lastFetchKeyRef.key === fetchKey) {
        return;
      }
      lastFetchKeyRef.key = fetchKey;
      setLoadingDiff(true);
      const prompts = await getPromptList(namespaceId, { name: promptName, status: 'published,draft' });
      const publishedList = prompts.filter(p => p.status === 'published');
      const draftList = prompts.filter(p => p.status === 'draft');
      const latestPublished = publishedList
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0];
      const latestDraft = draftList
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0];
      if (latestPublished) {
        setPublishedContent(latestPublished.content || '');
        setHasPublished(true);
      } else {
        setPublishedContent('');
        setHasPublished(false);
      }
      if (latestDraft) {
        setDraftContent(latestDraft.content || '');
      }
    } catch (error) {
      setHasPublished(false);
    } finally {
      setLoadingDiff(false);
    }
  }, [namespaceId, promptName, lastFetchKeyRef]);

  return {
    publishedContent,
    hasPublished,
    loadingDiff,
    draftContent,
    loadPublishedContent,
  };
}

export function usePromptContent(namespaceId: string) {
  const [historyContent, setHistoryContent] = useState<string>('');
  const [currentVersionContent, setCurrentVersionContent] = useState<string>('');

  const loadHistoryContent = useCallback(async (historyId: string) => {
    if (!namespaceId) return;
    try {
      const historyPrompt = await getPrompt(namespaceId, historyId);
      setHistoryContent(historyPrompt.content);
    } catch (error) {
      setHistoryContent('');
    }
  }, [namespaceId]);

  const loadCurrentVersionContent = useCallback(async (versionId: string) => {
    if (!namespaceId) return;
    try {
      const currentPrompt = await getPrompt(namespaceId, versionId);
      setCurrentVersionContent(currentPrompt.content);
    } catch (error) {
      setCurrentVersionContent('');
    }
  }, [namespaceId]);

  const clearVersionContent = useCallback(() => {
    setHistoryContent('');
    setCurrentVersionContent('');
  }, []);

  return {
    historyContent,
    currentVersionContent,
    loadHistoryContent,
    loadCurrentVersionContent,
    clearVersionContent,
  };
}
