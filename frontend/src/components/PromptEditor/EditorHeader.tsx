import styles from './index.module.scss';

interface EditorHeaderProps {
  title: string;
  onClick?: () => void;
  versionIcon?: React.ReactNode;
  status?: string;
}

export default function EditorHeader({ title, onClick, versionIcon, status }: EditorHeaderProps) {
  return (
    <div className={styles.header}>
      <span 
        className={`${styles.title} ${onClick ? styles.clickable : ''}`} 
        onClick={onClick}
      >
        {title}
      </span>
      {status && <span className={styles.status}>{status}</span>}
      {versionIcon && <div className={styles.headerActions}>{versionIcon}</div>}
    </div>
  );
}

