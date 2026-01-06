import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { Prompt } from '@/apis/prompt';
import styles from './index.module.scss';
import EditorHeader from './EditorHeader';
import VersionList from './VersionList';
import EditorArea from './EditorArea';
import AgentChat from './AgentChat';
import PublishModal from './PublishModal';
import { usePromptEditor } from './usePromptEditor';

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
  const {
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
  } = usePromptEditor({
    prompt,
    content,
    onPublish,
    namespaceId,
    promptId,
  });

  return (
    <div className={styles.container}>
      <EditorHeader 
        title={`当前版本: ${prompt?.name || ''}`} 
        onClick={handleTitleClick}
        status={!hasPublished && promptId ? '未发布' : undefined}
        versionIcon={
          <span
            className={styles.versionIcon}
            onClick={() => setAgentCollapsed(!agentCollapsed)}
            title={agentCollapsed ? '展开聊天' : '收起聊天'}
          >
            {agentCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </span>
        }
      />
      <div className={styles.content}>
        {showVersionList && (
          <VersionList 
            selectedVersion={selectedVersion} 
            onVersionChange={handleVersionChange}
            namespaceId={namespaceId}
            promptName={prompt?.name}
            currentPromptId={promptId}
            selectedHistoryId={selectedHistoryId}
            refreshTrigger={refreshTrigger}
          />
        )}
        <EditorArea
          ref={editorAreaRef}
          content={displayContent}
          onContentChange={onContentChange}
          actions={editorActions}
          showDiff={selectedVersion === 'diff' && hasPublished && content !== publishedContent}
          originalContent={publishedContent}
          modifiedContent={content}
          hasPublished={hasPublished}
          onAddToChat={handleAddToChat}
          fileName={prompt?.name || 'prompt.md'}
        />
        <AgentChat 
          ref={agentChatRef}
          editorAreaRef={editorAreaRef}
          collapsed={agentCollapsed}
          onToggleCollapsed={setAgentCollapsed}
          chatId={prompt?.id || (prompt?.name ? `name:${prompt.name}` : undefined)}
        />
      </div>
      <PublishModal
        open={publishModalVisible}
        onCancel={() => setPublishModalVisible(false)}
        onConfirm={onPublishConfirm}
        confirmLoading={publishing}
        description={publishDescription}
        onDescriptionChange={setPublishDescription}
      />
    </div>
  );
}
