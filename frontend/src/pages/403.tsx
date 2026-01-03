import { Result, Button } from 'antd';
import { useNavigate } from 'react-router';

export default function NoAuth() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Result
        status="403"
        title="403"
        subTitle="抱歉，您没有权限访问此页面。"
        extra={
          <Button type="primary" onClick={() => navigate('/')}>
            返回首页
          </Button>
        }
      />
    </div>
  );
}

