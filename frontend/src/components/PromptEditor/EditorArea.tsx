import { useRef, useEffect, useState, useImperativeHandle, forwardRef, useCallback } from 'react';
import { Button } from 'antd';
import { ConsoleSqlOutlined } from '@ant-design/icons';
import Editor, { DiffEditor, OnMount, DiffOnMount } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import styles from './index.module.scss';

export interface ActionButton {
  label: string;
  onClick: () => void;
  loading?: boolean;
  type?: 'default' | 'primary';
}

export interface CodeReferenceInfo {
  fileName: string;
  lineRange: string;
  content: string;
}

export interface EditorAreaRef {
  navigateToLine: (lineRange: string) => void;
  replaceCode: (content: string, lineRange?: string) => void;
}

interface EditorAreaProps {
  content: string;
  onContentChange: (content: string) => void;
  actions?: ActionButton[];
  showDiff?: boolean;
  originalContent?: string;
  modifiedContent?: string;
  hasPublished?: boolean;
  onAddToChat?: (content: string | CodeReferenceInfo) => void;
  fileName?: string;
}

const EditorArea = forwardRef<EditorAreaRef, EditorAreaProps>(({ 
  content, 
  onContentChange, 
  actions = [],
  showDiff = false,
  originalContent = '',
  modifiedContent = '',
  hasPublished = false,
  onAddToChat,
  fileName = 'editor'
}, ref) => {
  const diffEditorRef = useRef<monaco.editor.IStandaloneDiffEditor | null>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [selectedText, setSelectedText] = useState<string>('');
  const [selectedRange, setSelectedRange] = useState<{ startLine: number; endLine: number } | null>(null);
  const [buttonPosition, setButtonPosition] = useState<{ top: number; left: number } | null>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const navigateTimeoutsRef = useRef<{ focus?: NodeJS.Timeout; highlight?: NodeJS.Timeout }>({});

  const commonOptions = {
    minimap: { enabled: false },
    fontSize: 14,
    lineNumbers: 'on' as const,
    scrollBeyondLastLine: false,
    wordWrap: 'on' as const,
    automaticLayout: true,
    tabSize: 2,
    renderWhitespace: 'selection' as const,
  };

  const updateSelectedText = (editor: monaco.editor.IStandaloneCodeEditor) => {
    const selection = editor.getSelection();
    if (selection && !selection.isEmpty()) {
      const text = editor.getModel()?.getValueInRange(selection) || '';
      setSelectedText(text);
      
      const startLine = selection.startLineNumber;
      const endLine = selection.endLineNumber;
      setSelectedRange({ startLine, endLine });
      
      if (text.trim() && editorContainerRef.current) {
        const endPosition = selection.getEndPosition();
        const coords = editor.getScrolledVisiblePosition(endPosition);
        if (coords) {
          const editorContainer = editorContainerRef.current;
          const rect = editorContainer.getBoundingClientRect();
          const top = rect.top + coords.top + 20;
          const left = rect.left + coords.left;
          setButtonPosition({ top, left });
        }
      } else {
        setButtonPosition(null);
      }
    } else {
      setSelectedText('');
      setSelectedRange(null);
      setButtonPosition(null);
    }
  };

  const handleDiffEditorMount: DiffOnMount = (editor) => {
    diffEditorRef.current = editor;
    const modifiedEditor = editor.getModifiedEditor();
    
    // 确保 modified editor 是可编辑的
    modifiedEditor.updateOptions({ readOnly: false });
    
    modifiedEditor.onDidChangeModelContent(() => {
      const value = modifiedEditor.getValue();
      if (value !== content) {
        onContentChange(value);
      }
    });

    modifiedEditor.onDidChangeCursorSelection(() => {
      updateSelectedText(modifiedEditor);
    });

    modifiedEditor.onDidScrollChange(() => {
      if (selectedText.trim()) {
        updateSelectedText(modifiedEditor);
      }
    });
  };

  const handleEditorMount: OnMount = (editor) => {
    editorRef.current = editor;
    
    editor.onDidChangeCursorSelection(() => {
      updateSelectedText(editor);
    });

    editor.onDidScrollChange(() => {
      if (selectedText.trim()) {
        updateSelectedText(editor);
      }
    });
  };

  const getActiveEditor = useCallback(() => {
    if (diffEditorRef.current) {
      return diffEditorRef.current.getModifiedEditor();
    }
    return editorRef.current;
  }, []);

  const navigateToLine = useCallback((lineRange: string) => {
    const editor = getActiveEditor();
    if (!editor) return;

    editor.updateOptions({ readOnly: false });

    const match = lineRange.match(/(\d+)(?:-(\d+))?/);
    if (!match) return;
    
    const parsedStart = parseInt(match[1], 10);
    const parsedEnd = match[2] ? parseInt(match[2], 10) : parsedStart;

    const model = editor.getModel();
    if (!model) return;

    const lineCount = model.getLineCount();
    const startLine = Math.max(1, Math.min(parsedStart, lineCount));
    const endLine = Math.max(startLine, Math.min(parsedEnd, lineCount));

    editor.revealLineInCenter(startLine);

    editor.setSelection({
      startLineNumber: startLine,
      startColumn: 1,
      endLineNumber: endLine,
      endColumn: model.getLineLength(endLine) + 1,
    });

    const decorations = editor.deltaDecorations([], [
      {
        range: new monaco.Range(startLine, 1, endLine, model.getLineLength(endLine) + 1),
        options: {
          className: styles.highlightedLine,
          isWholeLine: true,
        },
      },
    ]);

    if (navigateTimeoutsRef.current.focus) {
      clearTimeout(navigateTimeoutsRef.current.focus);
    }
    if (navigateTimeoutsRef.current.highlight) {
      clearTimeout(navigateTimeoutsRef.current.highlight);
    }

    if (editorContainerRef.current) {
      editorContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    navigateTimeoutsRef.current.focus = setTimeout(() => {
      const currentEditor = getActiveEditor();
      if (!currentEditor) return;

      currentEditor.updateOptions({ readOnly: false });
      currentEditor.revealLineInCenter(startLine);
      
      currentEditor.setPosition({
        lineNumber: startLine,
        column: 1,
      });

      currentEditor.focus();
      
      navigateTimeoutsRef.current.focus = undefined;
    }, 100);

    navigateTimeoutsRef.current.highlight = setTimeout(() => {
      const currentEditor = getActiveEditor();
      if (currentEditor) {
        currentEditor.deltaDecorations(decorations, []);
      }
      navigateTimeoutsRef.current.highlight = undefined;
    }, 2000);
  }, [getActiveEditor]);
const replaceCode = useCallback((content: string, lineRange?: string) => {
    const editor = getActiveEditor();
    if (!editor) return;

    const model = editor.getModel();
    if (!model) return;

    editor.updateOptions({ readOnly: false });

    let range: monaco.Range | null = null;

    if (lineRange) {
      const match = lineRange.match(/(\d+)(?:-(\d+))?/);
      if (match) {
        const parsedStart = parseInt(match[1], 10);
        const parsedEnd = match[2] ? parseInt(match[2], 10) : parsedStart;
        
        const lineCount = model.getLineCount();
        const startLine = Math.max(1, Math.min(parsedStart, lineCount));
        const endLine = Math.max(startLine, Math.min(parsedEnd, lineCount));
        
        range = new monaco.Range(
          startLine, 
          1, 
          endLine, 
          model.getLineLength(endLine) + 1
        );
      }
    }

    if (!range) {
      const selection = editor.getSelection();
      if (selection && !selection.isEmpty()) {
        range = selection;
      } else {
        const lineCount = model.getLineCount();
        range = new monaco.Range(
          1, 
          1, 
          lineCount, 
          model.getLineLength(lineCount) + 1
        );
      }
    }

    if (range) {
      editor.executeEdits('agent-apply', [{
        range: range,
        text: content,
        forceMoveMarkers: true
      }]);
      editor.focus();
    }
  }, [getActiveEditor]);

  useImperativeHandle(ref, () => ({
    navigateToLine,
    replaceCode,
  }), [navigateToLine, replaceCode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        const saveAction = actions.find(a => a.label.includes('保存'));
        if (saveAction) {
          saveAction.onClick();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [actions]);

  useEffect(() => {
    if (showDiff && diffEditorRef.current && hasPublished) {
      const modifiedEditor = diffEditorRef.current.getModifiedEditor();
      const currentValue = modifiedEditor.getValue();
      if (currentValue !== modifiedContent) {
        modifiedEditor.setValue(modifiedContent);
      }
    }
  }, [modifiedContent, showDiff, hasPublished, content]);

  useEffect(() => {
    if (!selectedText.trim()) return;

    const updatePosition = () => {
      const editor = showDiff 
        ? diffEditorRef.current?.getModifiedEditor() 
        : editorRef.current;
      
      if (editor && selectedText.trim()) {
        updateSelectedText(editor);
      }
    };

    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [selectedText, showDiff]);

  // 清理 navigateToLine 的 timeout
  useEffect(() => {
    return () => {
      if (navigateTimeoutsRef.current.focus) {
        clearTimeout(navigateTimeoutsRef.current.focus);
      }
      if (navigateTimeoutsRef.current.highlight) {
        clearTimeout(navigateTimeoutsRef.current.highlight);
      }
    };
  }, []);

  const handleAddToChat = () => {
    if (onAddToChat && selectedText.trim() && selectedRange) {
      const lineRange = selectedRange.startLine === selectedRange.endLine 
        ? `${selectedRange.startLine}` 
        : `${selectedRange.startLine}-${selectedRange.endLine}`;
      
      const codeRef: CodeReferenceInfo = {
        fileName,
        lineRange,
        content: selectedText,
      };
      
      onAddToChat(codeRef);
    }
  };

  return (
    <div className={styles.editorArea}>
      {actions.length > 0 && (
        <div className={styles.editorHeader}>
          {actions.map((action, index) => (
            <Button
              key={index}
              type={action.type || 'default'}
              onClick={action.onClick}
              loading={action.loading}
            >
              {action.label}
            </Button>
          ))}
        </div>
      )}
      <div className={styles.editor} ref={editorContainerRef}>
        {showDiff ? (
          hasPublished ? (
            <DiffEditor
              height="100%"
              language="markdown"
              theme="vs-dark"
              original={originalContent}
              modified={modifiedContent}
              onMount={handleDiffEditorMount}
              options={{
                ...commonOptions,
                renderSideBySide: false,
                readOnly: false,
              } as any}
            />
          ) : (
            <div className={styles.noPublished}>
              <div className={styles.noPublishedText}>未发布</div>
            </div>
          )
        ) : (
          <Editor
            height="100%"
            language="markdown"
            theme="vs-dark"
            value={content}
            onChange={(value) => onContentChange(value || '')}
            onMount={handleEditorMount}
            options={{
              ...commonOptions,
              formatOnPaste: true,
              formatOnType: true,
            }}
          />
        )}
        {onAddToChat && buttonPosition && selectedText.trim() && (
          <div
            className={styles.floatingAddButton}
            style={{
              position: 'fixed',
              top: `${buttonPosition.top}px`,
              left: `${buttonPosition.left}px`,
              zIndex: 1000,
            }}
          >
            <button
              className={styles.terminalButton}
              onClick={handleAddToChat}
              title="将选中内容添加到聊天"
            >
              <span className={styles.terminalIcon}>
                <ConsoleSqlOutlined />
              </span>
              <span className={styles.terminalText}>添加到聊天</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

EditorArea.displayName = 'EditorArea';

export default EditorArea;
