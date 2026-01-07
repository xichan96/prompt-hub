import { Modal, Form, Input, Select, InputNumber, Divider } from 'antd';
import { UpdateMemorySettingRequest } from '@/apis/setting';
import { useI18n } from '@/hooks/useI18n';

interface MemorySettingModalProps {
  visible: boolean;
  form: any;
  onSubmit: (values: UpdateMemorySettingRequest) => void;
  onClose: () => void;
}

export const MemorySettingModal = ({
  visible,
  form,
  onSubmit,
  onClose,
}: MemorySettingModalProps) => {
  const { t } = useI18n();
  const provider = Form.useWatch('provider', form);

  return (
    <Modal
      title={t('memory.editConfigModal', '编辑Memory配置')}
      open={visible}
      onOk={() => form.submit()}
      onCancel={onClose}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmit}
        initialValues={{ provider: 'simple' }}
      >
        <Form.Item
          name="provider"
          label={t('memory.provider', 'Memory Provider')}
          rules={[{ required: true, message: t('memory.providerRequired', '请选择Provider') }]}
        >
          <Select>
            <Select.Option value="simple">Simple (In-Memory)</Select.Option>
            <Select.Option value="redis">Redis</Select.Option>
            <Select.Option value="mongodb">MongoDB</Select.Option>
          </Select>
        </Form.Item>

        <Divider />

        {provider === 'simple' && (
          <>
            <Form.Item
              name={['simple', 'max_history_messages']}
              label={t('memory.simple.maxHistory', '最大历史消息数')}
              rules={[{ required: true, message: t('memory.simple.maxHistoryRequired', '请输入最大历史消息数') }]}
            >
              <InputNumber style={{ width: '100%' }} min={1} />
            </Form.Item>
          </>
        )}

        {provider === 'redis' && (
          <>
            <Form.Item
              name={['redis', 'host']}
              label={t('common.host', 'Host')}
              rules={[{ required: true, message: t('common.hostRequired', '请输入Host') }]}
            >
              <Input placeholder="localhost" />
            </Form.Item>
            <Form.Item
              name={['redis', 'port']}
              label={t('common.port', 'Port')}
              rules={[{ required: true, message: t('common.portRequired', '请输入Port') }]}
            >
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
              name={['redis', 'username']}
              label={t('common.username', 'Username')}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name={['redis', 'password']}
              label={t('common.password', 'Password')}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item
              name={['redis', 'db']}
              label={t('memory.redis.db', 'DB')}
              rules={[{ required: true, message: t('memory.redis.dbRequired', '请输入DB') }]}
            >
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
            <Form.Item
              name={['redis', 'key_prefix']}
              label={t('memory.redis.keyPrefix', 'Key Prefix')}
            >
              <Input placeholder="memory:" />
            </Form.Item>
            <Form.Item
              name={['redis', 'max_history_messages']}
              label={t('memory.redis.maxHistory', '最大历史消息数')}
              rules={[{ required: true, message: t('memory.redis.maxHistoryRequired', '请输入最大历史消息数') }]}
            >
              <InputNumber style={{ width: '100%' }} min={1} />
            </Form.Item>
          </>
        )}

        {provider === 'mongodb' && (
          <>
            <Form.Item
              name={['mongodb', 'uri']}
              label={t('memory.mongodb.uri', 'URI')}
              rules={[{ required: true, message: t('memory.mongodb.uriRequired', '请输入URI') }]}
            >
              <Input placeholder="mongodb://localhost:27017" />
            </Form.Item>
            <Form.Item
              name={['mongodb', 'database']}
              label={t('memory.mongodb.database', 'Database')}
              rules={[{ required: true, message: t('memory.mongodb.databaseRequired', '请输入Database') }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name={['mongodb', 'collection']}
              label={t('memory.mongodb.collection', 'Collection')}
              rules={[{ required: true, message: t('memory.mongodb.collectionRequired', '请输入Collection') }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name={['mongodb', 'max_history_messages']}
              label={t('memory.mongodb.maxHistory', '最大历史消息数')}
              rules={[{ required: true, message: t('memory.mongodb.maxHistoryRequired', '请输入最大历史消息数') }]}
            >
              <InputNumber style={{ width: '100%' }} min={1} />
            </Form.Item>
          </>
        )}
      </Form>
    </Modal>
  );
};
