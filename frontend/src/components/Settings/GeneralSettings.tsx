import { Card, Table, Button, Space, Flex, Popconfirm, Input, TableColumnsType } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Setting } from '@/apis/setting';
import { useGeneralSettings } from '@/hooks/useGeneralSettings';
import { GeneralSettingModal } from './GeneralSettingModal';
import dayjs from 'dayjs';

export const GeneralSettings = () => {
  const {
    loading,
    settings,
    editingSetting,
    modalVisible,
    filterGroup,
    valueIsJson,
    jsonFields,
    form,
    setFilterGroup,
    setValueIsJson,
    setJsonFields,
    handleEdit,
    handleDelete,
    handleSubmit,
    handleCloseModal,
    handleCreate,
  } = useGeneralSettings();

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
      render: (_: any, record: Setting) => (
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

  return (
    <>
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
              onClick={handleCreate}
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

      <GeneralSettingModal
        visible={modalVisible}
        editingSetting={editingSetting}
        valueIsJson={valueIsJson}
        jsonFields={jsonFields}
        form={form}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        setValueIsJson={setValueIsJson}
        setJsonFields={setJsonFields}
      />
    </>
  );
};

