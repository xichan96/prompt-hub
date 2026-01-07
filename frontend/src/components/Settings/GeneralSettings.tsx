import { Card, Table, Button, Space, Flex, Popconfirm, Input, TableColumnsType } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Setting } from '@/apis/setting';
import { useGeneralSettings } from '@/hooks/useGeneralSettings';
import { GeneralSettingModal } from './GeneralSettingModal';
import dayjs from 'dayjs';
import { useI18n } from '@/hooks/useI18n';

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
  const { t } = useI18n();

  const columns: TableColumnsType<Setting> = [
    {
      title: t('settings.general.group', '分组'),
      dataIndex: 'group',
      key: 'group',
      align: 'center',
    },
    {
      title: t('settings.general.key', '键'),
      dataIndex: 'key',
      key: 'key',
      align: 'center',
    },
    {
      title: t('settings.general.value', '值'),
      dataIndex: 'value',
      key: 'value',
      align: 'center',
      ellipsis: true,
    },
    {
      title: t('settings.general.createdAt', '创建时间'),
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm:ss'),
      align: 'center',
    },
    {
      title: t('settings.general.updatedAt', '更新时间'),
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
      render: (_: any, record: Setting) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            {t('common.edit', '编辑')}
          </Button>
          <Popconfirm
            title={t('settings.general.deleteConfirmTitle', '确定要删除这个配置吗？')}
            onConfirm={() => handleDelete(record)}
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
              placeholder={t('settings.general.filterGroupPlaceholder', '筛选分组')}
              value={filterGroup}
              onChange={(e) => setFilterGroup(e.target.value)}
              style={{ width: 200 }}
              allowClear
            />
          </Space>
          <Space>
            <div>{t('common.totalPrefix', '共')} {settings.length} {t('settings.general.totalConfigsUnit', '个配置')}</div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
            >
              {t('settings.general.newSetting', '新增配置')}
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
            showTotal: (total) => `${t('common.totalPrefix', '共')} ${total} ${t('common.totalRecordsUnit', '条')}`,
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
