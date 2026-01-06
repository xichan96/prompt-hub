import PromptEditorComponent from '@/components/PromptEditor';
import styles from './PromptEditor.module.scss';
import { usePromptEditorController } from './usePromptEditorController';

export default function PromptEditor() {
  const {
    namespaceId,
    promptId,
    prompt,
    content,
    setContent,
    loading,
  } = usePromptEditorController();

  if (loading && !prompt) {
    return <div className={styles.loading}>加载中...</div>;
  }

  if (!prompt) {
    return null;
  }

  return (
    <PromptEditorComponent
      prompt={prompt}
      content={content}
      onContentChange={setContent}
      onPublish={() => {}}
      namespaceId={namespaceId || ''}
      promptId={promptId}
      showVersionList
    />
  );
}
