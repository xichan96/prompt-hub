import { useEffect, useState } from 'react';
import { Card, Table, Button, Space, message, Flex, Popconfirm, Form, Input, Modal, TableColumnsType, Tag, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router';
import { createPrompt, deletePrompt, getPromptList, updatePrompt, publishPrompt, Prompt, CreatePromptRequest, UpdatePromptRequest } from '@/apis/prompt';
import { getNamespaces, Namespace } from '@/apis/namespace';
import Page from '@/components/Page';
import dayjs from 'dayjs';

export default function NamespaceDetail() {
  const { namespaceId } = useParams<{ namespaceId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [namespace, setNamespace] = useState<Namespace | null>(null);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [filterName, setFilterName] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  const getNamespaceInfo = async () => {
    if (!namespaceId) return;
    try {
      const namespaces = await getNamespaces();
      const ns = namespaces.find(n => n.id === namespaceId);
      setNamespace(ns || null);
    } catch (error) {
      console.error(error);
    }
  };

  const getList = async () => {
    if (!namespaceId) return;
    try {
      setLoading(true);
      const params: { name?: string; status?: string } = {};
      if (filterName) params.name = filterName;
      if (filterStatus) params.status = filterStatus;
      const res = await getPromptList(namespaceId, params);
      setPrompts(res);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getNamespaceInfo();
  }, [namespaceId]);

  useEffect(() => {
    getList();
  }, [namespaceId, filterName, filterStatus]);

  const handleEdit = (record: Prompt) => {
    setEditingPrompt(record);
    form.setFieldsValue({ ...record });
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    if (!namespaceId) return;
    try {
      await deletePrompt(namespaceId, id);
      message.success('删除成功');
      getList();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handlePublish = async (id: string) => {
    if (!namespaceId) return;
    try {
      await publishPrompt(namespaceId, id);
      message.success('发布成功');
      getList();
    } catch (error) {
      message.error('发布失败');
    }
  };

  const handleSubmit = async (values: CreatePromptRequest | UpdatePromptRequest) => {
    if (!namespaceId) return;
    try {
      if (editingPrompt) {
        await updatePrompt(namespaceId, editingPrompt.id, { ...values, id: editingPrompt.id });
        message.success('更新成功');
      } else {
        await createPrompt(namespaceId, values as CreatePromptRequest);
        message.success('创建成功');
      }
      getList();
      setModalVisible(false);
      form.resetFields();
      setEditingPrompt(null);
    } catch (error) {
      message.error(editingPrompt ? '更新失败' : '创建失败');
    }
  };

  const columns: TableColumnsType<Prompt> = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      align: 'center',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      align: 'center',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          draft: 'default',
          published: 'success',
          archived: 'warning',
        };
        return <Tag color={colorMap[status] || 'default'}>{status}</Tag>;
      },
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
      width: 250,
      align: 'center',
      render: (_, record) => (
        <Space size="middle">
          {record.status === 'draft' && (
            <Button
              type="link"
              icon={<CheckCircleOutlined />}
              onClick={() => handlePublish(record.id)}
            >
              发布
            </Button>
          )}
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个提示词吗？"
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
    <Page 
      title={namespace?.name || '命名空间详情'} 
      description={namespace?.description || ''}
      extra={
        <Button onClick={() => navigate('/namespaces')}>
          返回列表
        </Button>
      }
    >
      <Card className="content-card">
        <Flex
          align="center"
          justify="space-between"
          gap={20}
          style={{ marginBottom: 16 }}
        >
          <Space>
            <Input
              placeholder="搜索名称"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              style={{ width: 200 }}
              allowClear
            />
            <Select
              placeholder="筛选状态"
              value={filterStatus}
              onChange={setFilterStatus}
              style={{ width: 150 }}
              allowClear
            >
              <Select.Option value="draft">草稿</Select.Option>
              <Select.Option value="published">已发布</Select.Option>
              <Select.Option value="archived">已归档</Select.Option>
            </Select>
          </Space>
          <Space>
            <div>共 {prompts.length} 个提示词</div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                form.resetFields();
                setEditingPrompt(null);
                setModalVisible(true);
              }}
            >
              新增提示词
            </Button>
          </Space>
        </Flex>

        <Table
          columns={columns}
          dataSource={prompts}
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
        title={editingPrompt ? '编辑提示词' : '新增提示词'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingPrompt(null);
        }}
        onOk={() => form.submit()}
        width={800}
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
            <Input placeholder="请输入名称" disabled={!!editingPrompt} />
          </Form.Item>
          <Form.Item
            name="description"
            label="描述"
          >
            <Input.TextArea placeholder="请输入描述" rows={3} />
          </Form.Item>
          <Form.Item
            name="content"
            label="内容"
            rules={[{ required: true, message: '请输入内容' }]}
          >
            <Input.TextArea placeholder="请输入提示词内容" rows={10} />
          </Form.Item>
        </Form>
      </Modal>
    </Page>
  );
}

