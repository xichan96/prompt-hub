import { useEffect, useState } from 'react';
import { Space, Button, Table, TableColumnsType, Flex, Popconfirm, Form, Input, Modal, message, Card, Select } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { createUser, deleteUser, getUsers, updateUser, User, CreateUserRequest, UpdateUserRequest } from '@/apis/user';
import Page from '@/components/Page';
import dayjs from 'dayjs';

export default function Users() {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  const getList = async () => {
    try {
      setLoading(true);
      const res = await getUsers();
      setUsers(res);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getList();
  }, []);

  const handleEdit = (record: User) => {
    setEditingUser(record);
    form.setFieldsValue({ ...record });
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteUser(id);
      message.success('删除成功');
      getList();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async (values: CreateUserRequest | UpdateUserRequest) => {
    try {
      if (editingUser) {
        await updateUser(editingUser.id, { ...values, id: editingUser.id });
        message.success('更新成功');
      } else {
        await createUser(values as CreateUserRequest);
        message.success('创建成功');
      }
      getList();
      setModalVisible(false);
      form.resetFields();
      setEditingUser(null);
    } catch (error) {
      message.error(editingUser ? '更新失败' : '创建失败');
    }
  };

  const columns: TableColumnsType<User> = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      align: 'center',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      align: 'center',
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm:ss'),
      align: 'center',
    },
    {
      title: '更新时间',
      dataIndex: 'updated_at',
      key: 'updated_at',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm:ss'),
      align: 'center',
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      align: 'center',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个用户吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Page title="用户管理" description="管理系统用户账号">
      <Card className="content-card">
        <Flex
          align="center"
          justify="flex-end"
          gap={20}
          style={{ marginBottom: 16 }}
        >
          <div>共 {users.length} 个用户</div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              form.resetFields();
              setEditingUser(null);
              setModalVisible(true);
            }}
          >
            新增用户
          </Button>
        </Flex>

        <Table
          columns={columns}
          dataSource={users}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
        />
      </Card>

      <Modal
        title={editingUser ? '编辑用户' : '新增用户'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingUser(null);
        }}
        onOk={() => form.submit()}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>
          <Form.Item
            name="password"
            label="密码"
            rules={[{ required: !editingUser, message: '请输入密码' }]}
          >
            <Input.Password placeholder={editingUser ? '留空则不修改' : '请输入密码'} />
          </Form.Item>
          <Form.Item
            name="role"
            label="角色"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select placeholder="请选择角色">
              <Select.Option value="admin">管理员</Select.Option>
              <Select.Option value="user">用户</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Page>
  );
}

