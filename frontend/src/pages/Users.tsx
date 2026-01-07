import { useEffect, useState } from 'react';
import { Space, Button, Table, TableColumnsType, Flex, Popconfirm, Form, Input, Modal, message, Card, Select } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { createUser, deleteUser, getUsers, updateUser, User, CreateUserRequest, UpdateUserRequest } from '@/apis/user';
import Page from '@/components/Page';
import dayjs from 'dayjs';
import { useI18n } from '@/hooks/useI18n';

export default function Users() {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const { t } = useI18n();

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
      message.success(t('common.deleteSuccess', '删除成功'));
      getList();
    } catch (error) {
      message.error(t('common.deleteFailed', '删除失败'));
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
      title: t('users.username', '用户名'),
      dataIndex: 'username',
      key: 'username',
      align: 'center',
    },
    {
      title: t('users.role', '角色'),
      dataIndex: 'role',
      key: 'role',
      align: 'center',
    },
    {
      title: t('users.createdAt', '创建时间'),
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm:ss'),
      align: 'center',
    },
    {
      title: t('users.updatedAt', '更新时间'),
      dataIndex: 'updated_at',
      key: 'updated_at',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm:ss'),
      align: 'center',
    },
    {
      title: t('common.actions', '操作'),
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
            {t('common.edit', '编辑')}
          </Button>
          <Popconfirm
            title={t('users.deleteConfirmTitle', '确定要删除这个用户吗？')}
            onConfirm={() => handleDelete(record.id)}
            okText={t('common.ok', '确定')}
            cancelText={t('common.cancel', '取消')}
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              {t('common.delete', '删除')}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Page title={t('users.title', '用户管理')} description={t('users.description', '管理系统用户账号')}>
      <Card className="content-card">
        <Flex
          align="center"
          justify="flex-end"
          gap={20}
          style={{ marginBottom: 16 }}
        >
          <div>{t('users.totalPrefix', '共')} {users.length} {t('users.totalUsersUnit', '个用户')}</div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              form.resetFields();
              setEditingUser(null);
              setModalVisible(true);
            }}
          >
            {t('users.create', '新增用户')}
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
            showTotal: (total) => `${t('common.totalPrefix', '共')} ${total} ${t('common.totalRecordsUnit', '条')}`,
          }}
        />
      </Card>

      <Modal
        title={editingUser ? t('users.editUser', '编辑用户') : t('users.newUser', '新增用户')}
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
            label={t('users.username', '用户名')}
            rules={[{ required: true, message: t('login.usernameRequired', '请输入用户名') }]}
          >
            <Input placeholder={t('login.usernameRequired', '请输入用户名')} />
          </Form.Item>
          <Form.Item
            name="password"
            label={t('users.password', '密码')}
            rules={[{ required: !editingUser, message: t('login.passwordRequired', '请输入密码') }]}
          >
            <Input.Password placeholder={editingUser ? t('users.passwordPlaceholderEdit', '留空则不修改') : t('users.passwordPlaceholderNew', '请输入密码')} />
          </Form.Item>
          <Form.Item
            name="role"
            label={t('users.role', '角色')}
            rules={[{ required: true, message: t('users.roleSelectRequired', '请选择角色') }]}
          >
            <Select placeholder={t('users.roleSelectPlaceholder', '请选择角色')}>
              <Select.Option value="admin">{t('users.role.admin', '管理员')}</Select.Option>
              <Select.Option value="user">{t('users.role.user', '用户')}</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Page>
  );
}
