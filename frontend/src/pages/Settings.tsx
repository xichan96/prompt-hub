import { useEffect, useState } from 'react';
import { Card, Table, Button, Space, message, Flex, Popconfirm, Form, Input, Modal, TableColumnsType, InputNumber } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { createSetting, deleteSetting, getSettings, updateSetting, Setting, CreateSettingRequest, UpdateSettingRequest, DeleteSettingRequest } from '@/apis/setting';
import Page from '@/components/Page';
import dayjs from 'dayjs';

export default function Settings() {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<Setting[]>([]);
  const [editingSetting, setEditingSetting] = useState<Setting | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [filterGroup, setFilterGroup] = useState<string>('');

  const getList = async () => {
    try {
      setLoading(true);
      const params = filterGroup ? { group: filterGroup } : undefined;
      const res = await getSettings(params);
      setSettings(res);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getList();
  }, [filterGroup]);

  const handleEdit = (record: Setting) => {
    setEditingSetting(record);
    form.setFieldsValue({ ...record });
    setModalVisible(true);
  };

  const handleDelete = async (record: Setting) => {
    try {
      await deleteSetting({ group: record.group, key: record.key });
      message.success('删除成功');
      getList();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async (values: CreateSettingRequest | UpdateSettingRequest) => {
    try {
      if (editingSetting) {
        await updateSetting(values as UpdateSettingRequest);
        message.success('更新成功');
      } else {
        await createSetting(values as CreateSettingRequest);
        message.success('创建成功');
      }
      getList();
      setModalVisible(false);
      form.resetFields();
      setEditingSetting(null);
    } catch (error) {
      message.error(editingSetting ? '更新失败' : '创建失败');
    }
  };

  const columns: TableColumnsType<Setting> = [
    {
      title: '分组',
      dataIndex: 'group',
      key: 'group',
      align: 'center',
    },
    {
      title: '键',
      dataIndex: 'key',
      key: 'key',
      align: 'center',
    },
    {
      title: '值',
      dataIndex: 'value',
      key: 'value',
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
            title="确定要删除这个配置吗？"
            onConfirm={() => handleDelete(record)}
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

  const groups = Array.from(new Set(settings.map(s => s.group)));

  return (
    <Page title="系统设置" description="管理系统配置项">
      <Card className="content-card">
        <Flex
          align="center"
          justify="space-between"
          gap={20}
          style={{ marginBottom: 16 }}
        >
          <Space>
            <Input
              placeholder="筛选分组"
              value={filterGroup}
              onChange={(e) => setFilterGroup(e.target.value)}
              style={{ width: 200 }}
              allowClear
            />
          </Space>
          <Space>
            <div>共 {settings.length} 个配置</div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                form.resetFields();
                setEditingSetting(null);
                setModalVisible(true);
              }}
            >
              新增配置
            </Button>
          </Space>
        </Flex>

        <Table
          columns={columns}
          dataSource={settings}
          loading={loading}
          rowKey={(record) => `${record.group}-${record.key}`}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
        />
      </Card>

      <Modal
        title={editingSetting ? '编辑配置' : '新增配置'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingSetting(null);
        }}
        onOk={() => form.submit()}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="group"
            label="分组"
            rules={[{ required: true, message: '请输入分组' }]}
          >
            <Input placeholder="请输入分组" />
          </Form.Item>
          <Form.Item
            name="key"
            label="键"
            rules={[{ required: true, message: '请输入键' }]}
          >
            <Input placeholder="请输入键" disabled={!!editingSetting} />
          </Form.Item>
          <Form.Item
            name="value"
            label="值"
            rules={[{ required: true, message: '请输入值' }]}
          >
            <Input.TextArea placeholder="请输入值" rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </Page>
  );
}

