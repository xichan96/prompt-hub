import { useEffect, useState, useRef } from 'react';
import { Button, Input, message, Avatar } from 'antd';
import { useParams, useNavigate } from 'react-router';
import { getPrompt, publishPrompt, Prompt } from '@/apis/prompt';
import { agentChat, AgentChatRequest } from '@/apis/agent';
import styles from './PromptEditor.module.scss';
import { SendOutlined } from '@ant-design/icons';

type VersionType = 'edit' | 'current' | 'history';

interface VersionItem {
  id: string;
  type: VersionType;
  label: string;
}

export default function PromptEditor() {
  const { namespaceId, promptId } = useParams<{ namespaceId: string; promptId: string }>();
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<VersionType>('edit');
  const [agentMessage, setAgentMessage] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'agent'; content: string }>>([]);
  const [sending, setSending] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (namespaceId && promptId) {
      loadPrompt();
    }
  }, [namespaceId, promptId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadPrompt = async () => {
    if (!namespaceId || !promptId) return;
    try {
      setLoading(true);
      const data = await getPrompt(namespaceId, promptId);
      setPrompt(data);
      setContent(data.content || '');
    } catch (error) {
      message.error('加载提示词失败');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!namespaceId || !promptId) return;
    try {
      setPublishing(true);
      await publishPrompt(namespaceId, promptId);
      message.success('发布成功');
      loadPrompt();
    } catch (error) {
      message.error('发布失败');
    } finally {
      setPublishing(false);
    }
  };

  const handleSendMessage = async () => {
    if (!agentMessage.trim() || sending) return;
    
    const userMessage = { role: 'user' as const, content: agentMessage };
    setMessages(prev => [...prev, userMessage]);
    const currentMessage = agentMessage;
    setAgentMessage('');
    setSending(true);

    try {
      const requestData: AgentChatRequest = {
        message: currentMessage,
      };
      if (sessionId) {
        requestData.session_id = sessionId;
      }

      const response = await agentChat(requestData);
      
      if (response.session_id && !sessionId) {
        setSessionId(response.session_id);
      }

      const agentResponse = { role: 'agent' as const, content: response.content || '' };
      setMessages(prev => [...prev, agentResponse]);
    } catch (error) {
      message.error('发送消息失败');
      setMessages(prev => prev.filter(msg => msg !== userMessage));
    } finally {
      setSending(false);
    }
  };

  const versions: VersionItem[] = [
    { id: 'edit', type: 'edit', label: '编辑版本' },
    { id: 'current', type: 'current', label: '当前版本' },
    { id: 'history2', type: 'history', label: '历史版本2' },
    { id: 'history1', type: 'history', label: '历史版本1' },
  ];

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (loading && !prompt) {
    return <div className={styles.loading}>加载中...</div>;
  }

  if (!prompt) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.title}>prompt: {prompt.name}</span>
      </div>
      <div className={styles.content}>
        <div className={styles.sidebar}>
          <div className={styles.versionList}>
            {versions.map((version) => (
              <div
                key={version.id}
                className={`${styles.versionItem} ${selectedVersion === version.type ? styles.active : ''}`}
                onClick={() => setSelectedVersion(version.type)}
              >
                {version.label}
              </div>
            ))}
          </div>
        </div>
        <div className={styles.editorArea}>
          <div className={styles.editorHeader}>
            <Button
              type="primary"
              onClick={handlePublish}
              loading={publishing}
            >
              发布
            </Button>
          </div>
          <div className={styles.editor}>
            <Input.TextArea
              ref={editorRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="编辑器"
              className={styles.textarea}
              bordered={false}
              autoSize={{ minRows: 20 }}
            />
          </div>
        </div>
        <div className={styles.agentSidebar}>
          <div className={styles.agentHeader}>
            <Avatar size={24} style={{ backgroundColor: '#1890ff' }}>A</Avatar>
            <span className={styles.agentTitle}>agent</span>
          </div>
          <div className={styles.messages}>
            {messages.length === 0 ? (
              <div className={styles.emptyMessage}>暂无对话</div>
            ) : (
              messages.map((msg, index) => (
                <div key={index} className={msg.role === 'user' ? styles.userMessage : styles.agentMessage}>
                  {msg.content}
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className={styles.inputArea}>
            <Input.TextArea
              value={agentMessage}
              onChange={(e) => setAgentMessage(e.target.value)}
              placeholder="输入消息..."
              className={styles.messageInput}
              autoSize={{ minRows: 1, maxRows: 4 }}
              onKeyPress={handleKeyPress}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSendMessage}
              className={styles.sendButton}
              loading={sending}
              disabled={sending}
            >
              发送
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

