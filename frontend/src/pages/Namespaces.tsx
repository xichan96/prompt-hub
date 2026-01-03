import { useEffect, useState } from 'react';
import { Card, Table, Button, Space, message, Flex, Popconfirm, Form, Input, Modal, TableColumnsType, Select, Tabs } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { createNamespace, deleteNamespace, getNamespaces, updateNamespace, Namespace, CreateNamespaceRequest, UpdateNamespaceRequest } from '@/apis/namespace';
import { createPrompt, deletePrompt, getPromptList, updatePrompt, Prompt, CreatePromptRequest, UpdatePromptRequest } from '@/apis/prompt';
import Page from '@/components/Page';
import dayjs from 'dayjs';

export default function Namespaces() {
  const [loading, setLoading] = useState(false);
  const [promptLoading, setPromptLoading] = useState(false);
  const [namespaces, setNamespaces] = useState<Namespace[]>([]);
  const [activeNamespaceId, setActiveNamespaceId] = useState<string>('');
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [editingNamespace, setEditingNamespace] = useState<Namespace | null>(null);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [namespaceModalVisible, setNamespaceModalVisible] = useState(false);
  const [promptModalVisible, setPromptModalVisible] = useState(false);
  const [namespaceForm] = Form.useForm();
  const [promptForm] = Form.useForm();
  const [filterName, setFilterName] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  const getNamespaceList = async () => {
    try {
      setLoading(true);
      const res = await getNamespaces();
      setNamespaces(res);
      if (res.length > 0 && !activeNamespaceId) {
        setActiveNamespaceId(res[0].id);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getPromptListData = async () => {
    if (!activeNamespaceId) return;
    try {
      setPromptLoading(true);
      const params: { name?: string; status?: string } = {};
      if (filterName) params.name = filterName;
      if (filterStatus) params.status = filterStatus;
      const res = await getPromptList(activeNamespaceId, params);
      setPrompts(res);
    } catch (error) {
      console.error(error);
    } finally {
      setPromptLoading(false);
    }
  };

  useEffect(() => {
    getNamespaceList();
  }, []);

  useEffect(() => {
    getPromptListData();
  }, [activeNamespaceId, filterName, filterStatus]);

  const handleEditNamespace = (record: Namespace) => {
    setEditingNamespace(record);
    namespaceForm.setFieldsValue({ ...record });
    setNamespaceModalVisible(true);
  };

  const handleDeleteNamespace = async (id: string) => {
    try {
      await deleteNamespace(id);
      message.success('删除成功');
      getNamespaceList();
      if (activeNamespaceId === id && namespaces.length > 1) {
        const nextNs = namespaces.find(ns => ns.id !== id);
        if (nextNs) {
          setActiveNamespaceId(nextNs.id);
        }
      }
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmitNamespace = async (values: CreateNamespaceRequest | UpdateNamespaceRequest) => {
    try {
      if (editingNamespace) {
        await updateNamespace(editingNamespace.id, { ...values, id: editingNamespace.id });
        message.success('更新成功');
      } else {
        await createNamespace(values as CreateNamespaceRequest);
        message.success('创建成功');
      }
      getNamespaceList();
      setNamespaceModalVisible(false);
      namespaceForm.resetFields();
      setEditingNamespace(null);
    } catch (error) {
      message.error(editingNamespace ? '更新失败' : '创建失败');
    }
  };

  const handleEditPrompt = (record: Prompt) => {
    setEditingPrompt(record);
    promptForm.setFieldsValue({ ...record });
    setPromptModalVisible(true);
  };

  const handleDeletePrompt = async (id: string) => {
    if (!activeNamespaceId) return;
    try {
      await deletePrompt(activeNamespaceId, id);
      message.success('删除成功');
      getPromptListData();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmitPrompt = async (values: CreatePromptRequest | UpdatePromptRequest) => {
    if (!activeNamespaceId) return;
    try {
      if (editingPrompt) {
        await updatePrompt(activeNamespaceId, editingPrompt.id, { ...values, id: editingPrompt.id });
        message.success('更新成功');
      } else {
        await createPrompt(activeNamespaceId, values as CreatePromptRequest);
        message.success('创建成功');
      }
      getPromptListData();
      setPromptModalVisible(false);
      promptForm.resetFields();
      setEditingPrompt(null);
    } catch (error) {
      message.error(editingPrompt ? '更新失败' : '创建失败');
    }
  };

  const promptColumns: TableColumnsType<Prompt> = [
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
      width: 150,
      align: 'center',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEditPrompt(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个提示词吗？"
            onConfirm={() => handleDeletePrompt(record.id)}
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
    <Page title="提示词管理">
      <Tabs
        activeKey={activeNamespaceId}
        onChange={setActiveNamespaceId}
        items={namespaces.map(ns => ({
          key: ns.id,
          label: ns.name,
        }))}
        style={{ marginBottom: 24 }}
        tabBarExtraContent={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              namespaceForm.resetFields();
              setEditingNamespace(null);
              setNamespaceModalVisible(true);
            }}
          >
            新增命名空间
          </Button>
        }
      />
      {activeNamespaceId && (
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
                placeholder="筛选"
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
              <div>共{prompts.length}个提示词</div>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  promptForm.resetFields();
                  setEditingPrompt(null);
                  setPromptModalVisible(true);
                }}
              >
                新增提示词
              </Button>
            </Space>
          </Flex>

          <Table
            columns={promptColumns}
            dataSource={prompts}
            loading={promptLoading}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 条`,
            }}
          />
        </Card>
      )}

      <Modal
        title={editingNamespace ? '编辑命名空间' : '新增命名空间'}
        open={namespaceModalVisible}
        onCancel={() => {
          setNamespaceModalVisible(false);
          namespaceForm.resetFields();
          setEditingNamespace(null);
        }}
        onOk={() => namespaceForm.submit()}
      >
        <Form
          form={namespaceForm}
          layout="vertical"
          onFinish={handleSubmitNamespace}
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

      <Modal
        title={editingPrompt ? '编辑提示词' : '新增提示词'}
        open={promptModalVisible}
        onCancel={() => {
          setPromptModalVisible(false);
          promptForm.resetFields();
          setEditingPrompt(null);
        }}
        onOk={() => promptForm.submit()}
        width={800}
      >
        <Form
          form={promptForm}
          layout="vertical"
          onFinish={handleSubmitPrompt}
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

