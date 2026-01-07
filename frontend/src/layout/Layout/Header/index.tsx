import { useNavigate, useLocation } from 'react-router';
import { useState } from 'react';
import { useAuthStore, useThemeStore } from '@/store';
import { Button, Dropdown } from 'antd';
import { UserOutlined, LogoutOutlined, SettingOutlined, KeyOutlined, SunOutlined, MoonOutlined } from '@ant-design/icons';
import ChangePasswordModal from '@/components/User/ChangePasswordModal';
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
  const { theme, toggleTheme } = useThemeStore();
  const [changePasswordModalVisible, setChangePasswordModalVisible] = useState(false);

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

  const userMenuItems: any[] = [];

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
    key: 'change-password',
    label: '修改密码',
    icon: <KeyOutlined />,
    onClick: () => setChangePasswordModalVisible(true),
  });

  userMenuItems.push({
    key: 'logout',
    label: '退出登陆',
    icon: <LogoutOutlined />,
    onClick: handleLogout,
    disabled: false,
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
          <Button
            type="text"
            icon={theme === 'dark' ? <SunOutlined /> : <MoonOutlined />}
            onClick={toggleTheme}
            style={{ marginRight: 8 }}
          />
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
      <ChangePasswordModal
        open={changePasswordModalVisible}
        onCancel={() => setChangePasswordModalVisible(false)}
      />
    </header >
  );
}

