import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router';
import { Prompt } from '@/apis/prompt';

export function usePromptEditorController() {
  const { namespaceId, promptId } = useParams<{ namespaceId: string; promptId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const state = location.state as { prompt?: Prompt } | undefined;
    if (state?.prompt) {
      setPrompt(state.prompt);
      setContent(state.prompt.content || '');
      setLoading(false);
    } else {
      navigate(-1);
    }
  }, [location.state, navigate]);

  return {
    namespaceId,
    promptId,
    prompt,
    content,
    setContent,
    loading,
  };
}
