import { useState } from 'react';
import { Button, Input, Avatar } from 'antd';
import { SendOutlined, ClearOutlined, RightOutlined } from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import { useAgentChat, Message } from '@/hooks/useAgentChat';
import styles from './index.module.scss';
import 'highlight.js/styles/github-dark.css';

export default function AgentChat() {
  const [collapsed, setCollapsed] = useState(false);
  const {
    agentMessage,
    setAgentMessage,
    messages,
    sending,
    messagesEndRef,
    handleSendMessage,
    handleClearContext,
  } = useAgentChat();

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      <div className={`${styles.agentSidebar} ${collapsed ? styles.collapsed : ''}`}>
        <div className={styles.agentHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Avatar size={24} style={{ backgroundColor: '#1890ff' }}>A</Avatar>
            <span className={styles.agentTitle}>agent</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {messages.length > 0 && (
              <Button
                type="text"
                size="small"
                icon={<ClearOutlined />}
                onClick={handleClearContext}
                className={styles.clearButton}
              >
                清理
              </Button>
            )}
            <Button
              type="text"
              size="small"
              icon={<RightOutlined />}
              onClick={() => setCollapsed(true)}
              className={styles.clearButton}
            />
          </div>
        </div>
        <div className={styles.messages}>
          {messages.length === 0 ? (
            <div className={styles.emptyMessage}>暂无对话</div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={msg.role === 'user' ? styles.userMessage : styles.agentMessage}>
                {msg.role === 'agent' ? (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight, rehypeRaw]}
                    components={{
                      code: ({ node, inline, className, children, ...props }: any) => {
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline && match ? (
                          <pre className={className}>
                            <code className={className} {...props}>
                              {children}
                            </code>
                          </pre>
                        ) : (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        );
                      },
                    }}
                  >
                    {msg.content || (msg.streaming ? '正在输入...' : '')}
                  </ReactMarkdown>
                ) : (
                  msg.content
                )}
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
      {collapsed && (
        <div className={styles.floatingAvatar} onClick={() => setCollapsed(false)}>
          <Avatar size={48} style={{ backgroundColor: '#1890ff', cursor: 'pointer' }}>A</Avatar>
        </div>
      )}
    </>
  );
}

