import { Outlet } from 'react-router';
import { Layout, Main, Content, Header } from './Layout';

export default function AppLayout() {
  return (
    <Layout>
      <Header />
      <Main>
        <Content>
          <Outlet />
        </Content>
      </Main>
    </Layout>
  );
}

