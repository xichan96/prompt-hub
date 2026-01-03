import { useEffect, useState } from 'react';
import { Card, Table, Button, Space, message, Flex, Popconfirm, Form, Input, Modal, TableColumnsType } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { createNamespace, deleteNamespace, getNamespaces, updateNamespace, Namespace, CreateNamespaceRequest, UpdateNamespaceRequest } from '@/apis/namespace';
import Page from '@/components/Page';
import { useNavigate } from 'react-router';
import dayjs from 'dayjs';

export default function Namespaces() {
  const [loading, setLoading] = useState(false);
  const [namespaces, setNamespaces] = useState<Namespace[]>([]);
  const [editingNamespace, setEditingNamespace] = useState<Namespace | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const getList = async () => {
    try {
      setLoading(true);
      const res = await getNamespaces();
      setNamespaces(res);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getList();
  }, []);

  const handleEdit = (record: Namespace) => {
    setEditingNamespace(record);
    form.setFieldsValue({ ...record });
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNamespace(id);
      message.success('删除成功');
      getList();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async (values: CreateNamespaceRequest | UpdateNamespaceRequest) => {
    try {
      if (editingNamespace) {
        await updateNamespace(editingNamespace.id, { ...values, id: editingNamespace.id });
        message.success('更新成功');
      } else {
        await createNamespace(values as CreateNamespaceRequest);
        message.success('创建成功');
      }
      getList();
      setModalVisible(false);
      form.resetFields();
      setEditingNamespace(null);
    } catch (error) {
      message.error(editingNamespace ? '更新失败' : '创建失败');
    }
  };

  const columns: TableColumnsType<Namespace> = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      align: 'center',
      render: (text: string, record: Namespace) => (
        <Button type="link" onClick={() => navigate(`/namespaces/${record.id}`)}>
          {text}
        </Button>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      align: 'center',
      ellipsis: true,
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
            title="确定要删除这个命名空间吗？"
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
    <Page title="命名空间管理" description="管理提示词的命名空间">
      <Card className="content-card">
        <Flex
          align="center"
          justify="flex-end"
          gap={20}
          style={{ marginBottom: 16 }}
        >
          <div>共 {namespaces.length} 个命名空间</div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              form.resetFields();
              setEditingNamespace(null);
              setModalVisible(true);
            }}
          >
            新增命名空间
          </Button>
        </Flex>

        <Table
          columns={columns}
          dataSource={namespaces}
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
        title={editingNamespace ? '编辑命名空间' : '新增命名空间'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingNamespace(null);
        }}
        onOk={() => form.submit()}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="名称"
            rules={[{ required: true, message: '请输入名称' }]}
          >
            <Input placeholder="请输入名称" />
          </Form.Item>
          <Form.Item
            name="description"
            label="描述"
          >
            <Input.TextArea placeholder="请输入描述" rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </Page>
  );
}

