import { useNavigate } from 'react-router';
import { useAuthStore } from '@/store';
import { Button, Dropdown } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import styles from './index.module.scss';

export interface HeaderProps {
  showLogo?: boolean;
  children?: React.ReactNode;
  extra?: React.ReactNode;
  style?: React.CSSProperties
}

export default function Header(props: HeaderProps) {
  const {
    showLogo = true,
    children,
    extra,
    style,
  } = props;

  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const userMenuItems = [
    {
      key: 'logout',
      label: '退出登录',
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ];

  return (
    <header className={styles.wrap} style={style}>
      <div className={styles.header}>
        <div className={styles.logo} onClick={() => navigate('/')}>
          {showLogo && (
            <span style={{ fontSize: 16, fontWeight: 500 }}>
              Prompt Hub
            </span>
          )}
        </div>

        <div className={styles.link}>
          {children}
        </div>

        <div className={styles.right}>
          {user && (
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Button type="text" icon={<UserOutlined />}>
                {user.username}
              </Button>
            </Dropdown>
          )}
          {extra}
        </div>
      </div>
    </header >
  );
}

