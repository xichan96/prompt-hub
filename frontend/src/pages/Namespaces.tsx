import { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Flex, Popconfirm, Form, Input, Modal, TableColumnsType, Tabs, Tooltip, Popover, theme } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, HistoryOutlined, SearchOutlined } from '@ant-design/icons';
import { Prompt, CreatePromptRequest } from '@/apis/prompt';
import { Namespace, CreateNamespaceRequest, UpdateNamespaceRequest } from '@/apis/namespace';
import Page from '@/components/Page';
import PromptEditor from '@/components/PromptEditor';
import dayjs from 'dayjs';
import { useNamespaceList, usePromptList } from '@/hooks';
import { useI18n } from '@/hooks/useI18n';

interface NamespaceTabLabelProps {
  ns: Namespace;
  onEdit: (ns: Namespace) => void;
  onDelete: (id: string) => void;
}

const NamespaceTabLabel = ({ ns, onEdit, onDelete }: NamespaceTabLabelProps) => {
  const { t } = useI18n();
  const content = (
    <div onClick={(e) => e.stopPropagation()}>
      <Space size={4}>
        <Button
          type="text"
          size="small"
          icon={<EditOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            onEdit(ns);
          }}
        />
        <Popconfirm
          title={t('namespaces.tabDeleteConfirmTitle', '确定要删除这个命名空间吗？')}
          description={t('namespaces.tabDeleteConfirmDesc', '删除后无法恢复，且该命名空间下的所有提示词也将被删除。')}
          onConfirm={(e) => {
            e?.stopPropagation();
            onDelete(ns.id);
          }}
          onCancel={(e) => e?.stopPropagation()}
          okText={t('common.ok', '确定')}
          cancelText={t('common.cancel', '取消')}
        >
          <Button
            type="text"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={(e) => e.stopPropagation()}
          />
        </Popconfirm>
      </Space>
    </div>
  );

  return (
    <Popover
      content={content}
      trigger="hover"
      placement="bottom"
      overlayInnerStyle={{ padding: '4px' }}
    >
      <span className="namespace-tab-label" title={ns.description || t('namespaces.noDescription', '暂无描述')}>
        {ns.name}
      </span>
    </Popover>
  );
};

export default function Namespaces() {
  const { token } = theme.useToken();
  const { t } = useI18n();
  const [activeNamespaceId, setActiveNamespaceId] = useState<string>('');
  const [editingNamespace, setEditingNamespace] = useState<Namespace | null>(null);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [namespaceModalVisible, setNamespaceModalVisible] = useState(false);
  const [promptModalVisible, setPromptModalVisible] = useState(false);
  const [namespaceForm] = Form.useForm();
  const [promptForm] = Form.useForm();
  const [filterName, setFilterName] = useState<string>('');
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const [editorContent, setEditorContent] = useState<string>('');
  const [editorPrompt, setEditorPrompt] = useState<Prompt | null>(null);
  const [showVersionList, setShowVersionList] = useState<boolean>(false);

  const { namespaces, loading, fetchNamespaces, handleDelete: handleDeleteNamespace, handleCreate: handleCreateNamespace, handleUpdate: handleUpdateNamespace } = useNamespaceList();
  const { prompts, loading: promptLoading, fetchPrompts, handleDelete: handleDeletePrompt, handleCreate: handleCreatePrompt, handleUpdate: handleUpdatePrompt, handlePublish: handlePublishPrompt, loadPrompt } = usePromptList(activeNamespaceId, filterName);

  useEffect(() => {
    if (namespaces.length > 0 && !activeNamespaceId) {
      setActiveNamespaceId(namespaces[0].id);
    }
  }, [namespaces, activeNamespaceId]);

  const handleEditNamespace = (record: Namespace) => {
    setEditingNamespace(record);
    namespaceForm.setFieldsValue({ ...record });
    setNamespaceModalVisible(true);
  };

  const handleDeleteNamespaceWithSwitch = async (id: string) => {
    await handleDeleteNamespace(id);
    if (activeNamespaceId === id && namespaces.length > 1) {
      const nextNs = namespaces.find(ns => ns.id !== id);
      if (nextNs) {
        setActiveNamespaceId(nextNs.id);
      }
    }
  };

  const handleSubmitNamespace = async (values: CreateNamespaceRequest | UpdateNamespaceRequest) => {
    if (editingNamespace) {
      await handleUpdateNamespace(editingNamespace.id, values as UpdateNamespaceRequest);
    } else {
      await handleCreateNamespace(values as CreateNamespaceRequest);
    }
    setNamespaceModalVisible(false);
    namespaceForm.resetFields();
    setEditingNamespace(null);
  };

  const handleEditPrompt = async (record: Prompt) => {
    setEditorPrompt(record);
    setEditorContent(record.content || '');
    setEditingPrompt(record);
    setPromptModalVisible(true);
  };

  const handleSubmitPrompt = async () => {
    if (!editingPrompt) return;
    const success = await handleUpdatePrompt(editingPrompt.id, editorContent);
    if (success) {
      setPromptModalVisible(false);
      setEditingPrompt(null);
      setEditorPrompt(null);
      setEditorContent('');
    }
  };

  const handleCreatePromptSubmit = async (values: CreatePromptRequest) => {
    const success = await handleCreatePrompt(values);
    if (success) {
      setPromptModalVisible(false);
      promptForm.resetFields();
    }
  };

  const handlePublishPromptWithRefresh = async () => {
    if (!editingPrompt) return;
    const success = await handlePublishPrompt(editingPrompt.id);
    if (success) {
      const data = await loadPrompt(editingPrompt.id);
      if (data) {
        setEditorPrompt(data);
        setEditorContent(data.content || '');
      }
    }
  };

  const promptColumns: TableColumnsType<Prompt> = [
    {
      title: t('common.name', '名称'),
      dataIndex: 'name',
      key: 'name',
      align: 'center',
      render: (text: string, record: Prompt) => (
        <Button
          type="link"
          onClick={() => handleEditPrompt(record)}
          style={{ padding: 0 }}
        >
          {text}
        </Button>
      ),
    },
    {
      title: t('common.description', '描述'),
      dataIndex: 'description',
      key: 'description',
      align: 'center',
      ellipsis: true,
    },
    {
      title: t('namespaces.createdAt', '创建时间'),
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm:ss'),
      align: 'center',
    },
    {
      title: t('namespaces.updatedAt', '更新时间'),
      dataIndex: 'updated_at',
      key: 'updated_at',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm:ss'),
      align: 'center',
    },
    {
      title: t('common.actions', '操作'),
      key: 'action',
      width: 180,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEditPrompt(record)}
            style={{ padding: 0 }}
          >
            {t('common.edit', '编辑')}
          </Button>
          <Popconfirm
            title={t('namespaces.deletePromptConfirmTitle', '确定要删除这个提示词吗？')}
            onConfirm={() => handleDeletePrompt(record.id)}
            okText={t('common.ok', '确定')}
            cancelText={t('common.cancel', '取消')}
          >
            <Button type="link" danger icon={<DeleteOutlined />} style={{ padding: 0 }}>
              {t('common.delete', '删除')}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Page title={t('namespaces.pageTitle', '提示词管理')}>
      <Tabs
        activeKey={activeNamespaceId}
        onChange={(key) => {
          if (key === 'add_namespace') return;
          setActiveNamespaceId(key);
        }}
        onTabClick={(key) => {
          if (key === 'add_namespace') {
            namespaceForm.resetFields();
            setEditingNamespace(null);
            setNamespaceModalVisible(true);
          }
        }}
        items={[
          ...namespaces.map(ns => ({
            key: ns.id,
            label: (
              <NamespaceTabLabel
                ns={ns}
                onEdit={handleEditNamespace}
                onDelete={handleDeleteNamespaceWithSwitch}
              />
            ),
          })),
          {
            key: 'add_namespace',
            label: <PlusOutlined />,
          }
        ]}
        style={{ marginBottom: namespaces.find(ns => ns.id === activeNamespaceId)?.description ? 12 : 24 }}
      />
      {namespaces.find(ns => ns.id === activeNamespaceId)?.description && (
        <div style={{ marginBottom: 24, color: token.colorTextSecondary }}>
          {namespaces.find(ns => ns.id === activeNamespaceId)?.description}
        </div>
      )}
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
                prefix={<SearchOutlined style={{ color: token.colorTextPlaceholder }} />}
                placeholder={t('namespaces.searchPlaceholder', '搜索提示词名称...')}
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                style={{ 
                  width: isSearchFocused ? 360 : 120,
                  transition: 'width 0.3s ease-in-out',
                }}
                size="large"
                allowClear
              />
            </Space>
            <Space>
              <div>{t('namespaces.totalPrefix', '共')}{prompts.length}{t('namespaces.totalPromptsUnit', '个提示词')}</div>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  promptForm.resetFields();
                  setEditingPrompt(null);
                  setEditorPrompt(null);
                  setEditorContent('');
                  setPromptModalVisible(true);
                }}
              >
                {t('namespaces.createPrompt', '新增提示词')}
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
              showTotal: (total) => `${t('common.totalPrefix', '共')} ${total} ${t('common.totalRecordsUnit', '条')}`,
            }}
          />
        </Card>
      )}

      <Modal
        title={editingNamespace ? t('namespaces.modal.editNamespace', '编辑命名空间') : t('namespaces.modal.newNamespace', '新增命名空间')}
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
            label={t('common.name', '名称')}
            rules={[{ required: true, message: t('common.nameRequired', '请输入名称') }]}
          >
            <Input placeholder={t('common.nameRequired', '请输入名称')} />
          </Form.Item>
          <Form.Item
            name="description"
            label={t('common.description', '描述')}
          >
            <Input.TextArea placeholder={t('common.descriptionPlaceholder', '请输入描述')} rows={4} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={
          editingPrompt ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>{t('namespaces.modal.editPrompt', '编辑提示词')}</span>
              <HistoryOutlined 
                style={{ cursor: 'pointer' }}
                onClick={() => setShowVersionList(!showVersionList)}
              />
            </span>
          ) : (
            t('namespaces.modal.newPrompt', '新增提示词')
          )
        }
        open={promptModalVisible}
        onCancel={() => {
          setPromptModalVisible(false);
          promptForm.resetFields();
          setEditingPrompt(null);
          setEditorPrompt(null);
          setEditorContent('');
        }}
        onOk={() => {
          if (editingPrompt) {
            handleSubmitPrompt();
          } else {
            promptForm.submit();
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
            onPublish={handlePublishPromptWithRefresh}
            namespaceId={activeNamespaceId}
            promptId={editingPrompt.id}
            showVersionList={showVersionList}
          />
        ) : (
          <div style={{ padding: 24 }}>
            <Form
              form={promptForm}
              layout="vertical"
              onFinish={handleCreatePromptSubmit}
            >
              <Form.Item
                name="name"
                label={t('common.name', '名称')}
                rules={[{ required: true, message: t('common.nameRequired', '请输入名称') }]}
              >
                <Input placeholder={t('common.nameRequired', '请输入名称')} />
              </Form.Item>
              <Form.Item
                name="description"
                label={t('common.description', '描述')}
              >
                <Input.TextArea placeholder={t('common.descriptionPlaceholder', '请输入描述')} rows={3} />
              </Form.Item>
              <Form.Item
                name="content"
                label={t('common.content', '内容')}
                rules={[{ required: true, message: t('common.contentRequired', '请输入内容') }]}
              >
                <Input.TextArea placeholder={t('namespaces.promptContentPlaceholder', '请输入提示词内容')} rows={10} />
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </Page>
  );
}
