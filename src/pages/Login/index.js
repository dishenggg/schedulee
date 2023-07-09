import React, { useEffect, useState } from 'react';
import { auth } from '../../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Card, Form, Button, Input } from 'antd';
import { useNavigate } from 'react-router-dom';
import { Title } from '../../components/Typography/Title';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const handleLogin = async (values) => {
    try {
      setError('');
      setLoading(true);
      await signInWithEmailAndPassword(auth, values.email, values.password);
      navigate('/');
    } catch (err) {
      setError('Failed to login: ' + err);
      alert(err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (auth.currentUser) {
      navigate("/");
    }
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}
    >
      <Card style={{ width: 400, height: 350 }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Title level={2}>Schedulee</Title>
        </div>
        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={handleLogin}
          onSubmit={(e) => e.preventDefault()}
        >
          <Form.Item name="email" rules={[{ required: true, message: 'Please enter email' }]}>
            <Input prefix={<UserOutlined />} placeholder="email" type="email" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: 'Please enter password' }]}>
            <Input prefix={<LockOutlined />} type="password" placeholder="Password" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" disabled={loading} block>
              Log in
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
