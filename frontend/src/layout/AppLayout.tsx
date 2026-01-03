import { Outlet, useLocation } from 'react-router';
import { Layout, Main, Content, Header, Sider, SiderProps } from './Layout';
import { FolderOutlined, UserOutlined, SettingOutlined } from '@ant-design/icons';
import { useAuthStore } from '@/store';

export default function AppLayout() {
  const location = useLocation();
  const { user } = useAuthStore();

  const menus: SiderProps['menus'] = [
    {
      key: '/namespaces',
      icon: <FolderOutlined />,
      label: '命名空间',
    },
  ];

  if (user?.role === 'admin') {
    menus.push(
      {
        key: '/users',
        icon: <UserOutlined />,
        label: '用户管理',
      },
      {
        key: '/settings',
        icon: <SettingOutlined />,
        label: '系统设置',
      }
    );
  }

  return (
    <Layout>
      <Header />
      <Main>
        <Sider menus={menus} />
        <Content>
          <Outlet />
        </Content>
      </Main>
    </Layout>
  );
}

