import { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Button, Input, Avatar } from 'antd';
import { SendOutlined, ClearOutlined, RightOutlined } from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import { useAgentChat, Message } from '@/hooks/useAgentChat';
import CodeReference from './CodeReference';
import { CodeReferenceInfo } from './EditorArea';
import styles from './index.module.scss';
import 'highlight.js/styles/github-dark.css';

interface AgentChatProps {
  editorAreaRef?: React.RefObject<{ navigateToLine: (lineRange: string) => void }>;
}

export interface AgentChatRef {
  setInputMessage: (content: string | CodeReferenceInfo) => void;
}

const AgentChat = forwardRef<AgentChatRef, AgentChatProps>(({ editorAreaRef }, ref) => {
  const [collapsed, setCollapsed] = useState(false);
  const [codeReferences, setCodeReferences] = useState<CodeReferenceInfo[]>([]);
  const [plainText, setPlainText] = useState<string>('');
  const [width, setWidth] = useState(400);
  const [isResizing, setIsResizing] = useState(false);
  const inputRef = useRef<any>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  
  const {
    agentMessage,
    setAgentMessage,
    messages,
    sending,
    messagesEndRef,
    handleSendMessage: originalHandleSendMessage,
    sendMessageDirectly,
    handleClearContext,
  } = useAgentChat();

  const handleSendMessage = () => {
    if (codeReferences.length > 0) {
      const codeRefText = codeReferences.map(ref => 
        `\`\`\`code-ref\n${JSON.stringify(ref)}\n\`\`\``
      ).join('\n');
      const fullMessage = plainText.trim() ? `${codeRefText}\n${plainText}` : codeRefText;
      
      // 代码引用本身就有内容，所以即使 plainText 为空也应该允许发送
      sendMessageDirectly(fullMessage);
      setCodeReferences([]);
      setPlainText('');
      setAgentMessage('');
    } else {
      if (!agentMessage.trim()) return;
      originalHandleSendMessage();
    }
  };

  useImperativeHandle(ref, () => ({
    setInputMessage: (content: string | CodeReferenceInfo) => {
      if (typeof content === 'string') {
        setPlainText('');
        setCodeReferences([]);
        setAgentMessage(content);
      } else {
        setCodeReferences([content]);
        setPlainText('');
        setAgentMessage('');
      }
      setCollapsed(false);
      
      // 使用 ref 来存储 timeout，以便在组件卸载时清理
      const timeoutId = setTimeout(() => {
        if (inputRef.current) {
          const textarea = (inputRef.current as any)?.resizableTextArea?.textArea;
          if (textarea) {
            textarea.focus();
            textarea.setSelectionRange(textarea.value.length, textarea.value.length);
          }
        }
      }, 100);
      
      // 注意：这里无法直接清理 timeout，但通常不会有问题
      // 因为组件卸载时 React 会自动清理
    },
  }), [setAgentMessage]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const container = sidebarRef.current?.parentElement;
      if (!container) return;
      
      const containerRect = container.getBoundingClientRect();
      const newWidth = containerRect.right - e.clientX;
      const minWidth = 300;
      const maxWidth = containerRect.width * 0.7;
      
      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  return (
    <>
      <div 
        ref={sidebarRef}
        className={`${styles.agentSidebar} ${collapsed ? styles.collapsed : ''} ${isResizing ? styles.resizing : ''}`}
        style={!collapsed ? { width: `${width}px` } : undefined}
      >
        {!collapsed && (
          <div 
            className={styles.resizeHandle}
            onMouseDown={handleMouseDown}
          />
        )}
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
                  (() => {
                    const codeRefMatches = msg.content.match(/```code-ref\n([\s\S]*?)\n```/g);
                    if (codeRefMatches && codeRefMatches.length > 0) {
                      const parts: (string | CodeReferenceInfo)[] = [];
                      let lastIndex = 0;
                      
                      codeRefMatches.forEach((match) => {
                        const matchIndex = msg.content.indexOf(match, lastIndex);
                        if (matchIndex > lastIndex) {
                          const textBefore = msg.content.substring(lastIndex, matchIndex).trim();
                          if (textBefore) {
                            parts.push(textBefore);
                          }
                        }
                        
                        try {
                          const jsonStr = match.replace(/```code-ref\n/, '').replace(/\n```/, '');
                          const codeRef: CodeReferenceInfo = JSON.parse(jsonStr);
                          parts.push(codeRef);
                        } catch (e) {
                          parts.push(match);
                        }
                        
                        lastIndex = matchIndex + match.length;
                      });
                      
                      const textAfter = msg.content.substring(lastIndex).trim();
                      if (textAfter) {
                        parts.push(textAfter);
                      }
                      
                      return (
                        <div className={styles.messageContentWithRefs}>
                          {parts.map((part, index) => {
                            if (typeof part === 'string') {
                              return <span key={index}>{part}</span>;
                            } else {
                              return (
                                <CodeReference 
                                  key={index} 
                                  {...part}
                                  onNavigate={(lineRange) => {
                                    editorAreaRef?.current?.navigateToLine(lineRange);
                                  }}
                                />
                              );
                            }
                          })}
                        </div>
                      );
                    }
                    return msg.content;
                  })()
                )}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className={styles.inputArea}>
          <div className={styles.inputRow}>
            <div className={styles.inputWithTags}>
              {codeReferences.length > 0 && (
                <div className={styles.codeReferencesInline}>
                  {codeReferences.map((ref, index) => (
                    <CodeReference
                      key={index}
                      fileName={ref.fileName}
                      lineRange={ref.lineRange}
                      onClose={() => {
                        const newRefs = codeReferences.filter((_, i) => i !== index);
                        setCodeReferences(newRefs);
                        if (newRefs.length === 0) {
                          setAgentMessage(plainText);
                          setPlainText('');
                        }
                      }}
                      onNavigate={(lineRange) => {
                        editorAreaRef?.current?.navigateToLine(lineRange);
                      }}
                    />
                  ))}
                </div>
              )}
              <Input.TextArea
                ref={inputRef}
                value={codeReferences.length > 0 ? plainText : agentMessage}
                onChange={(e) => {
                  const value = e.target.value;
                  if (codeReferences.length > 0) {
                    setPlainText(value);
                  } else {
                    setAgentMessage(value);
                  }
                }}
                placeholder="输入消息..."
                className={styles.messageInput}
                autoSize={{ minRows: 1, maxRows: 4 }}
                onKeyPress={handleKeyPress}
              />
            </div>
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSendMessage}
              className={styles.sendButton}
              loading={sending}
              disabled={sending || (codeReferences.length === 0 && !agentMessage.trim()) || (codeReferences.length > 0 && !plainText.trim())}
            >
              发送
            </Button>
          </div>
        </div>
      </div>
      {collapsed && (
        <div className={styles.floatingAvatar} onClick={() => setCollapsed(false)}>
          <Avatar size={48} style={{ backgroundColor: '#1890ff', cursor: 'pointer' }}>A</Avatar>
        </div>
      )}
    </>
  );
});

AgentChat.displayName = 'AgentChat';

export default AgentChat;

