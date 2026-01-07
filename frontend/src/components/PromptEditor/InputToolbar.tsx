import { Button, Switch } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import styles from './index.module.scss';

interface InputToolbarProps {
  onSend: () => void;
  sending: boolean;
  disabled: boolean;
  autoApply?: boolean;
  onToggleAutoApply?: () => void;
}

export default function InputToolbar({ 
  onSend, 
  sending, 
  disabled, 
  autoApply, 
  onToggleAutoApply 
}: InputToolbarProps) {
  return (
    <div className={styles.inputToolbar}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ color: 'var(--text-color-secondary)', fontSize: '12px' }}>AutoEdit</span>
        {onToggleAutoApply && (
          <Switch
            checkedChildren=""
            unCheckedChildren=""
            checked={autoApply}
            onChange={onToggleAutoApply}
            size="small"
            style={{ backgroundColor: autoApply ? 'var(--success-color)' : undefined }}
          />
        )}
      </div>
      <Button
        type="primary"
        icon={<SendOutlined />}
        onClick={onSend}
        className={styles.toolbarSendButton}
        loading={sending}
        disabled={disabled}
      />
    </div>
  );
}
