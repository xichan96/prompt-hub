import { useRef, useEffect } from 'react';
import { Button } from 'antd';
import Editor, { DiffEditor, OnMount, DiffOnMount } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import styles from './index.module.scss';

export interface ActionButton {
  label: string;
  onClick: () => void;
  loading?: boolean;
  type?: 'default' | 'primary';
}

interface EditorAreaProps {
  content: string;
  onContentChange: (content: string) => void;
  actions?: ActionButton[];
  showDiff?: boolean;
  originalContent?: string;
  modifiedContent?: string;
  hasPublished?: boolean;
}

export default function EditorArea({ 
  content, 
  onContentChange, 
  actions = [],
  showDiff = false,
  originalContent = '',
  modifiedContent = '',
  hasPublished = false
}: EditorAreaProps) {
  const diffEditorRef = useRef<monaco.editor.IStandaloneDiffEditor | null>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

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

  const handleDiffEditorMount: DiffOnMount = (editor) => {
    diffEditorRef.current = editor;
    const modifiedEditor = editor.getModifiedEditor();
    
    modifiedEditor.onDidChangeModelContent(() => {
      const value = modifiedEditor.getValue();
      if (value !== content) {
        onContentChange(value);
      }
    });
  };

  const handleEditorMount: OnMount = (editor) => {
    editorRef.current = editor;
  };

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
      <div className={styles.editor}>
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
              }}
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
      </div>
    </div>
  );
}

