import { useCallback } from 'react';
import { useAutoApply } from '@/hooks/useAutoApply';
import { isPromptContent, shouldAutoApply, extractPromptContent } from '@/utils/promptDetector';

interface UseAgentMessageHandlerOptions {
  onAgentMessageComplete?: (content: string, userMessage: string) => void;
  onApplyToEditor?: (content: string) => void;
}

export function useAgentMessageHandler({ onAgentMessageComplete, onApplyToEditor }: UseAgentMessageHandlerOptions) {
  const { autoApply } = useAutoApply();

  const handleAgentMessageComplete = useCallback((content: string, userMessage: string) => {
    if (onAgentMessageComplete) {
      onAgentMessageComplete(content, userMessage);
    }

    if (onApplyToEditor && autoApply) {
      const isPrompt = isPromptContent(content);
      const shouldAuto = shouldAutoApply(userMessage);

      if (isPrompt && shouldAuto) {
        const extracted = extractPromptContent(content);
        onApplyToEditor(extracted);
      }
    }
  }, [onAgentMessageComplete, onApplyToEditor, autoApply]);

  return {
    handleAgentMessageComplete,
  };
}

