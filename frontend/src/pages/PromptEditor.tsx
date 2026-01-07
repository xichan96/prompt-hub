import PromptEditorComponent from '@/components/PromptEditor';
import styles from './PromptEditor.module.scss';
import { usePromptEditorController } from './usePromptEditorController';
import { useI18n } from '@/hooks/useI18n';

export default function PromptEditor() {
  const {
    namespaceId,
    promptId,
    prompt,
    content,
    setContent,
    loading,
  } = usePromptEditorController();
  const { t } = useI18n();

  if (loading && !prompt) {
    return <div className={styles.loading}>{t('common.loading', '加载中...')}</div>;
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
