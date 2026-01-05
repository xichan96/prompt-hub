import { Button } from 'antd';
import { useAutoApply } from '@/hooks/useAutoApply';
import styles from './index.module.scss';

export default function AutoApplyToggle() {
  const { autoApply, toggleAutoApply } = useAutoApply();

  return (
    <Button
      type="text"
      size="small"
      onClick={toggleAutoApply}
      className={styles.autoApplyButton}
      title={autoApply ? '自动应用已开启' : '自动应用已关闭'}
    >
      {autoApply ? '自动' : '手动'}
    </Button>
  );
}

