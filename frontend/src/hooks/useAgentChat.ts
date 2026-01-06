import { useState, useRef, useCallback, useEffect } from 'react';
import { getAgentSession, AgentChatRequest } from '@/apis/agent';
import { useAuthStore } from '@/store';

export interface Message {
  id: string;
  role: 'user' | 'agent';
  content: string;
  streaming?: boolean;
  userMessage?: string;
}

interface ChatCache {
  sessionId: string;
  messages: Message[];
}

const STORAGE_KEY = 'agent_chat_cache';
const AUTO_APPLY_KEY = 'agent_auto_apply';

export interface UseAgentChatOptions {
  onAgentMessageComplete?: (content: string, userMessage: string) => void;
  id?: string;
}

export function useAgentChat(options?: UseAgentChatOptions) {
  const { onAgentMessageComplete, id } = options || {};
  const [agentMessage, setAgentMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [sending, setSending] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const sessionIdRef = useRef<string>('');

  const getStorageKey = useCallback(() => {
    return id ? `${STORAGE_KEY}_${id}` : STORAGE_KEY;
  }, [id]);

  const loadCache = useCallback((): ChatCache | null => {
    try {
      const cached = localStorage.getItem(getStorageKey());
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      console.error('Failed to load chat cache:', error);
    }
    return null;
  }, [getStorageKey]);

  const saveCache = useCallback((data: ChatCache) => {
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save chat cache:', error);
    }
  }, [getStorageKey]);

  const clearCache = useCallback(() => {
    try {
      localStorage.removeItem(getStorageKey());
    } catch (error) {
      console.error('Failed to clear chat cache:', error);
    }
  }, [getStorageKey]);

  useEffect(() => {
    const cached = loadCache();
    if (cached) {
      setSessionId(cached.sessionId);
      sessionIdRef.current = cached.sessionId;
      const messagesWithId = cached.messages.map((msg: any) => ({
        ...msg,
        id: msg.id || `${msg.role}-${Date.now()}-${Math.random()}`,
      }));
      setMessages(messagesWithId);
    } else {
      setSessionId('');
      sessionIdRef.current = '';
      setMessages([]);
    }
  }, [loadCache]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (sessionId || messages.length > 0) {
      saveCache({ sessionId, messages });
    }
  }, [sessionId, messages, saveCache]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleClearContext = useCallback(() => {
    setSessionId('');
    sessionIdRef.current = '';
    setMessages([]);
    clearCache();
  }, [clearCache]);

  const sendMessageInternal = useCallback(async (messageContent: string) => {
    if (!messageContent.trim() || sending) return;
    
    const userMessage: Message = {
      id: `user-${Date.now()}-${Math.random()}`,
      role: 'user',
      content: messageContent,
      userMessage: messageContent,
    };
    setSending(true);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    const agentMessageId = `agent-${Date.now()}-${Math.random()}`;
    setMessages(prev => [
      ...prev,
      userMessage,
      { id: agentMessageId, role: 'agent', content: '', streaming: true, userMessage: messageContent },
    ]);

    try {
      let currentSessionId = sessionIdRef.current || sessionId;
      const { token } = useAuthStore.getState();

      if (!currentSessionId) {
        const sessionResponse = await getAgentSession();
        currentSessionId = sessionResponse.session_id;
        sessionIdRef.current = currentSessionId;
        setSessionId(currentSessionId);
      }

      const requestData: AgentChatRequest = {
        message: messageContent,
        session_id: currentSessionId,
      };

      const response = await fetch('/api/agent/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'X-JWT': token } : {}),
        },
        body: JSON.stringify(requestData),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.msg || errorData.message || 'Stream request failed');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let receivedSessionId = currentSessionId;

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.trim() === '') continue;
            
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim();
              if (data === '[DONE]') {
                setMessages(prev => {
                  const updated = prev.map(msg =>
                    msg.id === agentMessageId
                      ? { ...msg, streaming: false }
                      : msg
                  );
                  const completedMessage = updated.find(msg => msg.id === agentMessageId);
                  if (completedMessage && onAgentMessageComplete && completedMessage.content) {
                    setTimeout(() => {
                      onAgentMessageComplete(completedMessage.content, completedMessage.userMessage || '');
                    }, 100);
                  }
                  return updated;
                });
                continue;
              }

              try {
                const parsed = JSON.parse(data);
                let contentDelta = '';
                
                if (parsed.data) {
                  if (parsed.data.content !== undefined) {
                    contentDelta = parsed.data.content || '';
                  }
                  if (parsed.data.session_id) {
                    const newSessionId = parsed.data.session_id;
                    if (newSessionId !== receivedSessionId) {
                      receivedSessionId = newSessionId;
                      sessionIdRef.current = newSessionId;
                      setSessionId(newSessionId);
                    }
                  }
                } else if (parsed.content !== undefined) {
                  contentDelta = parsed.content || '';
                }

                if (contentDelta) {
                  setMessages(prev =>
                    prev.map(msg =>
                      msg.id === agentMessageId
                        ? { ...msg, content: msg.content + contentDelta }
                        : msg
                    )
                  );
                  
                  if (messagesEndRef.current) {
                    messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
                  }
                }
              } catch (e) {
                console.error('Failed to parse SSE data:', e, data);
              }
            }
          }
        }

        setMessages(prev => {
          const updated = prev.map(msg =>
            msg.id === agentMessageId ? { ...msg, streaming: false } : msg
          );
          const completedMessage = updated.find(msg => msg.id === agentMessageId);
          if (completedMessage && onAgentMessageComplete && completedMessage.content) {
            setTimeout(() => {
              onAgentMessageComplete(completedMessage.content, completedMessage.userMessage || '');
            }, 100);
          }
          return updated;
        });
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return;
      }
      setMessages(prev =>
        prev.map(msg =>
          msg.id === agentMessageId
            ? {
                ...msg,
                content: msg.content || '请求失败，请重试',
                streaming: false,
              }
            : msg
        )
      );
    } finally {
      setSending(false);
      abortControllerRef.current = null;
    }
  }, [sending, sessionId, onAgentMessageComplete]);

  const handleSendMessage = useCallback(async () => {
    if (!agentMessage.trim()) return;
    const currentMessage = agentMessage;
    setAgentMessage('');
    await sendMessageInternal(currentMessage);
  }, [agentMessage, sendMessageInternal]);

  const sendMessageDirectly = useCallback(async (content: string) => {
    await sendMessageInternal(content);
  }, [sendMessageInternal]);

  return {
    agentMessage,
    setAgentMessage,
    messages,
    sending,
    messagesEndRef,
    handleSendMessage,
    sendMessageDirectly,
    handleClearContext,
  };
}

