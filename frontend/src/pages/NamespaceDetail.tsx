import { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Flex, Popconfirm, Form, Input, Modal, TableColumnsType, Tabs } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, HistoryOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router';
import { Prompt, CreatePromptRequest } from '@/apis/prompt';
import { Namespace } from '@/apis/namespace';
import Page from '@/components/Page';
import PromptEditor from '@/components/PromptEditor';
import dayjs from 'dayjs';
import { useNamespaceList, usePromptList } from '@/hooks';

export default function NamespaceDetail() {
  const { namespaceId } = useParams<{ namespaceId: string }>();
  const navigate = useNavigate();
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [filterName, setFilterName] = useState<string>('');
  const [editorContent, setEditorContent] = useState<string>('');
  const [editorPrompt, setEditorPrompt] = useState<Prompt | null>(null);
  const [showVersionList, setShowVersionList] = useState<boolean>(false);

  const { namespaces } = useNamespaceList();
  const { prompts, loading, handleDelete, handleCreate, handleUpdate, handlePublish, loadPrompt } = usePromptList(namespaceId || '', filterName);

  const namespace = namespaceId ? namespaces.find(n => n.id === namespaceId) || null : null;

  const handleEdit = async (record: Prompt) => {
    const data = await loadPrompt(record.id);
    if (data) {
      setEditorPrompt(data);
      setEditorContent(data.content || '');
      setEditingPrompt(data);
      setModalVisible(true);
    }
  };

  const handleSubmit = async () => {
    if (!editingPrompt) return;
    const success = await handleUpdate(editingPrompt.id, editorContent);
    if (success) {
      setModalVisible(false);
      setEditingPrompt(null);
      setEditorPrompt(null);
      setEditorContent('');
    }
  };

  const handleCreateSubmit = async (values: CreatePromptRequest) => {
    const success = await handleCreate(values);
    if (success) {
      setModalVisible(false);
      form.resetFields();
    }
  };

  const handlePublishWithRefresh = async () => {
    if (!editingPrompt) return;
    const success = await handlePublish(editingPrompt.id);
    if (success) {
      const data = await loadPrompt(editingPrompt.id);
      if (data) {
        setEditorPrompt(data);
        setEditorContent(data.content || '');
      }
    }
  };

  const columns: TableColumnsType<Prompt> = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      align: 'center',
      render: (text: string, record: Prompt) => (
        <Button
          type="link"
          onClick={() => handleEdit(record)}
          style={{ padding: 0 }}
        >
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
      width: 180,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            style={{ padding: 0 }}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个提示词吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />} style={{ padding: 0 }}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleTabChange = (key: string) => {
    navigate(`/namespaces/${key}`);
  };

  return (
    <Page title="提示词管理">
      <Tabs
        activeKey={namespaceId}
        onChange={handleTabChange}
        items={namespaces.map(ns => ({
          key: ns.id,
          label: ns.name,
        }))}
        style={{ marginBottom: 24 }}
      />
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
          </Space>
          <Space>
            <div>共{prompts.length}个提示词</div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                form.resetFields();
                setEditingPrompt(null);
                setEditorPrompt(null);
                setEditorContent('');
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
        title={
          editingPrompt ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>编辑提示词</span>
              <HistoryOutlined 
                style={{ cursor: 'pointer' }}
                onClick={() => setShowVersionList(!showVersionList)}
              />
            </span>
          ) : (
            '新增提示词'
          )
        }
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingPrompt(null);
          setEditorPrompt(null);
          setEditorContent('');
        }}
        onOk={() => {
          if (editingPrompt) {
            handleSubmit();
          } else {
            form.submit();
          }
        }}
        footer={editingPrompt ? null : undefined}
        width="95%"
        style={{ top: 20 }}
        bodyStyle={{ height: 'calc(100vh - 120px)', padding: 0 }}
        destroyOnClose
      >
        {editingPrompt ? (
          <PromptEditor
            prompt={editorPrompt}
            content={editorContent}
            onContentChange={setEditorContent}
            onPublish={handlePublishWithRefresh}
            namespaceId={namespaceId || ''}
            promptId={editingPrompt.id}
            showVersionList={showVersionList}
          />
        ) : (
          <div style={{ padding: 24 }}>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleCreateSubmit}
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
          </div>
        )}
      </Modal>

    </Page>
  );
}

