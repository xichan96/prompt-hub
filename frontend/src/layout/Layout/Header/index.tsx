import { useNavigate, useLocation } from 'react-router';
import { useAuthStore } from '@/store';
import { Button, Dropdown } from 'antd';
import { UserOutlined, LogoutOutlined, FolderOutlined, SettingOutlined } from '@ant-design/icons';
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
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActivePath = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const handleNavigate = (path: string) => {
    if (!isActivePath(path)) {
      navigate(path);
    }
  };

  const userMenuItems = [
    {
      key: 'namespaces',
      label: '命名空间',
      icon: <FolderOutlined />,
      onClick: () => handleNavigate('/namespaces'),
      disabled: isActivePath('/namespaces'),
    },
  ];

  if (user?.role === 'admin') {
    userMenuItems.push(
      {
        key: 'users',
        label: '用户管理',
        icon: <UserOutlined />,
        onClick: () => handleNavigate('/users'),
        disabled: isActivePath('/users'),
      },
      {
        key: 'settings',
        label: '系统设置',
        icon: <SettingOutlined />,
        onClick: () => handleNavigate('/settings'),
        disabled: isActivePath('/settings'),
      }
    );
  }

  userMenuItems.push({
    key: 'logout',
    label: '退出登陆',
    icon: <LogoutOutlined />,
    onClick: handleLogout,
  });

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

