import React, { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { login as loginApi } from '@/apis/auth';
import { useAuthStore } from '@/store';
import { useNavigate } from 'react-router';
import { getUserInfoFromToken } from '@/utils/jwt';

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true);
    
    try {
      const { token } = await loginApi(values);
      const userInfo = getUserInfoFromToken(token);
      if (userInfo) {
        login(userInfo, token);
        message.success('登录成功！');
        navigate('/');
      } else {
        message.error('登录失败，无法解析用户信息');
      }
    } catch (error) {
      message.error('登录失败，请重试！');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: 400,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
          borderRadius: 16,
          backgroundColor: '#1f1f1f',
          border: '1px solid #434343',
        }}
        styles={{ 
          body: { padding: '40px 32px' }
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ 
            fontSize: 24, 
            fontWeight: 600, 
            color: 'rgba(255, 255, 255, 0.85)',
            margin: 0 
          }}>
            Prompt Hub
          </h1>
        </div>

        <Form
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="用户名"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{
                width: '100%',
                height: 48,
                fontSize: 16,
                fontWeight: 600,
                borderRadius: 8,
              }}
            >
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;

