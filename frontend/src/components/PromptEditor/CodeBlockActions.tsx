import { Button, Dropdown } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import { extractCodeBlocks } from '@/utils/promptDetector';
import styles from './index.module.scss';

interface CodeBlockActionsProps {
  content: string;
  onApply: (content: string) => void;
}

export default function CodeBlockActions({ content, onApply }: CodeBlockActionsProps) {
  const extracted = extractCodeBlocks(content);

  if (extracted.length === 0) {
    return (
      <Button
        type="text"
        size="small"
        icon={<FileTextOutlined />}
        onClick={() => onApply(content.trim())}
        className={styles.inlineApplyButton}
      >
        应用
      </Button>
    );
  }

  if (extracted.length === 1) {
    return (
      <Button
        type="text"
        size="small"
        icon={<FileTextOutlined />}
        onClick={() => onApply(extracted[0].content)}
        className={styles.inlineApplyButton}
      >
        应用代码块
      </Button>
    );
  }

  const menuItems = extracted.map((block, index) => ({
    key: index,
    label: (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>{block.language || 'text'}</span>
        <span style={{ color: 'var(--text-color-secondary)', fontSize: '12px' }}>
          ({block.content.length} 字符)
        </span>
      </div>
    ),
    onClick: () => onApply(block.content),
  }));

  return (
    <Dropdown
      menu={{ items: menuItems }}
      trigger={['click']}
      placement="bottomRight"
    >
      <Button
        type="text"
        size="small"
        icon={<FileTextOutlined />}
        className={styles.inlineApplyButton}
      >
        应用代码块 ({extracted.length})
      </Button>
    </Dropdown>
  );
}

