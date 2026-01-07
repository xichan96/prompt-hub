import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Prompt } from '@/apis/prompt';
import { VersionType } from './types';
import { usePromptOperations, usePromptVersions, usePromptContent } from '@/hooks';
import { ActionButton, EditorAreaRef } from './EditorArea';
import { AgentChatRef } from './AgentChat';
import { useI18n } from '@/hooks/useI18n';

interface UsePromptEditorProps {
  prompt: Prompt | null;
  content: string;
  onPublish?: () => void;
  namespaceId: string;
  promptId?: string;
}

export function usePromptEditor({
  prompt,
  content,
  onPublish,
  namespaceId,
  promptId,
}: UsePromptEditorProps) {
  const { t } = useI18n();
  const [selectedVersion, setSelectedVersion] = useState<VersionType>('diff');
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | undefined>();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [publishModalVisible, setPublishModalVisible] = useState(false);
  const [publishDescription, setPublishDescription] = useState('');
  const [agentCollapsed, setAgentCollapsed] = useState(false);
  
  const editorAreaRef = useRef<EditorAreaRef>(null);
  const agentChatRef = useRef<AgentChatRef>(null);
  const lastSavedContentRef = useRef<string>('');

  const { publishing, saving, handleSave, handlePublish } = usePromptOperations(namespaceId, promptId);
  const { publishedContent, hasPublished, loadPublishedContent } = usePromptVersions(namespaceId, prompt?.name);
  const { 
    historyContent, 
    currentVersionContent, 
    loadHistoryContent, 
    loadCurrentVersionContent, 
    clearVersionContent 
  } = usePromptContent(namespaceId);

  // Initial load
  useEffect(() => {
    if (namespaceId && prompt?.name) {
      setSelectedVersion('diff');
      setSelectedHistoryId(undefined);
      clearVersionContent();
      loadPublishedContent();
    }
  }, [namespaceId, prompt?.name, promptId, loadPublishedContent, clearVersionContent]);

  // Auto-save
  useEffect(() => {
    const shouldAutoSave = promptId && (selectedVersion === 'edit' || selectedVersion === 'diff');
    if (!shouldAutoSave) return;
    
    const intervalId = setInterval(async () => {
      const current = (content || '').trim();
      const last = (lastSavedContentRef.current || '').trim();
      if (!current || current === last) return;
      
      const success = await handleSave(content, false);
      if (success) {
        lastSavedContentRef.current = content;
        if (selectedVersion === 'diff' && namespaceId && prompt?.name) {
          await loadPublishedContent();
        }
      }
    }, 30000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [promptId, selectedVersion, content, handleSave, namespaceId, prompt?.name, loadPublishedContent]);

  const onSave = useCallback(async () => {
    const success = await handleSave(content);
    if (success && selectedVersion === 'diff' && namespaceId && prompt?.name) {
      await loadPublishedContent();
    }
  }, [handleSave, content, selectedVersion, namespaceId, prompt?.name, loadPublishedContent]);

  const onPublishClick = useCallback(() => {
    setPublishDescription(prompt?.description || '');
    setPublishModalVisible(true);
  }, [prompt?.description]);

  const onPublishConfirm = useCallback(async () => {
    const success = await handlePublish(publishDescription);
    if (success) {
      setPublishModalVisible(false);
      setPublishDescription('');
      onPublish?.();
      if (selectedVersion === 'edit' || selectedVersion === 'diff') {
        await loadPublishedContent({ force: true });
      }
      setRefreshTrigger(prev => prev + 1);
    }
  }, [handlePublish, publishDescription, onPublish, selectedVersion, loadPublishedContent]);

  const handleTitleClick = async () => {
    setSelectedVersion('diff');
    setSelectedHistoryId(undefined);
    if (namespaceId && prompt?.name) {
      await loadPublishedContent();
    }
  };

  const handleVersionChange = async (version: VersionType, historyId?: string) => {
    setSelectedVersion(version);
    if (version === 'diff') {
      setSelectedHistoryId(historyId);
      if (namespaceId && prompt?.name) {
        await loadPublishedContent();
      }
    } else if (version === 'history' && historyId) {
      setSelectedHistoryId(historyId);
      await loadHistoryContent(historyId);
    } else if (version === 'current' && historyId) {
      await loadCurrentVersionContent(historyId);
    } else if (version === 'edit') {
      clearVersionContent();
    }
  };

  const handleAddToChat = useCallback((chatContent: string | any) => {
    agentChatRef.current?.setInputMessage(chatContent);
  }, []);

  const displayContent = useMemo(() => {
    if (selectedVersion === 'history') return historyContent;
    if (selectedVersion === 'current') return currentVersionContent;
    return content;
  }, [selectedVersion, historyContent, currentVersionContent, content]);

  const editorActions = useMemo<ActionButton[]>(() => {
    const actions: ActionButton[] = [];
    
    if (promptId && (selectedVersion === 'edit' || selectedVersion === 'diff')) {
      actions.push({
        label: t('promptEditor.saveEditedVersion', '保存编辑版本'),
        onClick: onSave,
        loading: saving,
      });
    }
    
    if (promptId && selectedVersion === 'diff') {
      actions.push({
        label: t('promptEditor.publish', '发布'),
        onClick: onPublishClick,
        loading: publishing,
        type: 'primary',
      });
    }
    
    return actions;
  }, [promptId, selectedVersion, onSave, saving, onPublishClick, publishing, t]);

  return {
    selectedVersion,
    selectedHistoryId,
    refreshTrigger,
    publishModalVisible,
    publishDescription,
    setPublishDescription,
    setPublishModalVisible,
    agentCollapsed,
    setAgentCollapsed,
    editorAreaRef,
    agentChatRef,
    publishing,
    hasPublished,
    publishedContent,
    displayContent,
    editorActions,
    handleTitleClick,
    handleVersionChange,
    onPublishConfirm,
    handleAddToChat,
  };
}
