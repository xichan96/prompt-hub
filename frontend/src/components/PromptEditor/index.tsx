import { useState, useEffect, useMemo, useCallback } from 'react';
import { Modal, Input } from 'antd';
import { Prompt } from '@/apis/prompt';
import styles from './index.module.scss';
import EditorHeader from './EditorHeader';
import VersionList from './VersionList';
import EditorArea, { ActionButton } from './EditorArea';
import AgentChat from './AgentChat';
import { VersionType } from './types';
import { usePromptOperations, usePromptVersions, usePromptContent } from '@/hooks';

interface PromptEditorProps {
  prompt: Prompt | null;
  content: string;
  onContentChange: (content: string) => void;
  onPublish?: () => void;
  namespaceId: string;
  promptId?: string;
  showVersionList?: boolean;
}

export default function PromptEditor({ prompt, content, onContentChange, onPublish, namespaceId, promptId, showVersionList = false }: PromptEditorProps) {
  const [selectedVersion, setSelectedVersion] = useState<VersionType>('diff');
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | undefined>();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [publishModalVisible, setPublishModalVisible] = useState(false);
  const [publishDescription, setPublishDescription] = useState('');

  const { publishing, saving, handleSave, handlePublish } = usePromptOperations(namespaceId, promptId);
  const { publishedContent, hasPublished, loadPublishedContent } = usePromptVersions(namespaceId, prompt?.name);
  const { historyContent, currentVersionContent, loadHistoryContent, loadCurrentVersionContent, clearVersionContent } = usePromptContent(namespaceId);

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
        await loadPublishedContent();
      }
      setRefreshTrigger(prev => prev + 1);
    }
  }, [handlePublish, publishDescription, onPublish, selectedVersion, loadPublishedContent]);

  useEffect(() => {
    if (namespaceId && prompt?.name) {
      setSelectedVersion('diff');
      setSelectedHistoryId(undefined);
      clearVersionContent();
      loadPublishedContent();
    }
  }, [namespaceId, prompt?.name, promptId, loadPublishedContent, clearVersionContent]);

  useEffect(() => {
    if (selectedVersion === 'diff' && namespaceId && prompt?.name) {
      loadPublishedContent();
    }
  }, [selectedVersion, namespaceId, prompt?.name, loadPublishedContent]);

  const handleTitleClick = async () => {
    setSelectedVersion('diff');
    setSelectedHistoryId(undefined);
    if (namespaceId && prompt?.name) {
      await loadPublishedContent();
    }
  };

  const editorActions = useMemo<ActionButton[]>(() => {
    const actions: ActionButton[] = [];
    
    if (promptId && (selectedVersion === 'edit' || selectedVersion === 'diff')) {
      actions.push({
        label: '保存编辑版本',
        onClick: onSave,
        loading: saving,
      });
    }
    
    if (promptId && selectedVersion === 'diff') {
      actions.push({
        label: '发布',
        onClick: onPublishClick,
        loading: publishing,
        type: 'primary',
      });
    }
    
    return actions;
  }, [promptId, selectedVersion, onSave, saving, onPublishClick, publishing]);

  const displayContent = useMemo(() => {
    if (selectedVersion === 'history') return historyContent;
    if (selectedVersion === 'current') return currentVersionContent;
    return content;
  }, [selectedVersion, historyContent, currentVersionContent, content]);

  return (
    <div className={styles.container}>
      <EditorHeader 
        title={`当前版本: ${prompt?.name || ''}`} 
        onClick={handleTitleClick}
        status={!hasPublished && promptId ? '编辑中' : undefined}
      />
      <div className={styles.content}>
        {showVersionList && (
          <VersionList 
          selectedVersion={selectedVersion} 
          onVersionChange={async (version, historyId) => {
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
          }}
          namespaceId={namespaceId}
          promptName={prompt?.name}
          currentPromptId={promptId}
          selectedHistoryId={selectedHistoryId}
          refreshTrigger={refreshTrigger}
          />
        )}
        <EditorArea
          content={displayContent}
          onContentChange={onContentChange}
          actions={editorActions}
          showDiff={selectedVersion === 'diff'}
          originalContent={publishedContent}
          modifiedContent={content}
          hasPublished={hasPublished}
        />
        <AgentChat />
      </div>
      <Modal
        title="发布提示词"
        open={publishModalVisible}
        onOk={onPublishConfirm}
        onCancel={() => {
          setPublishModalVisible(false);
          setPublishDescription('');
        }}
        confirmLoading={publishing}
        okText="发布"
        cancelText="取消"
      >
        <Input.TextArea
          placeholder="请输入发布描述（可选）"
          value={publishDescription}
          onChange={(e) => setPublishDescription(e.target.value)}
          rows={4}
          maxLength={255}
          showCount
        />
      </Modal>
    </div>
  );
}

