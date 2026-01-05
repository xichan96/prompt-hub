import { Modal, Form, Input, Select, InputNumber, Divider } from 'antd';
import { UpdateMemorySettingRequest } from '@/apis/setting';

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
  const provider = Form.useWatch('provider', form);

  return (
    <Modal
      title="编辑Memory配置"
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
          label="Memory Provider"
          rules={[{ required: true, message: '请选择Provider' }]}
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
              label="最大历史消息数"
              rules={[{ required: true, message: '请输入最大历史消息数' }]}
            >
              <InputNumber style={{ width: '100%' }} min={1} />
            </Form.Item>
          </>
        )}

        {provider === 'redis' && (
          <>
            <Form.Item
              name={['redis', 'host']}
              label="Host"
              rules={[{ required: true, message: '请输入Host' }]}
            >
              <Input placeholder="localhost" />
            </Form.Item>
            <Form.Item
              name={['redis', 'port']}
              label="Port"
              rules={[{ required: true, message: '请输入Port' }]}
            >
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
              name={['redis', 'username']}
              label="Username"
            >
              <Input />
            </Form.Item>
            <Form.Item
              name={['redis', 'password']}
              label="Password"
            >
              <Input.Password />
            </Form.Item>
            <Form.Item
              name={['redis', 'db']}
              label="DB"
              rules={[{ required: true, message: '请输入DB' }]}
            >
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
            <Form.Item
              name={['redis', 'key_prefix']}
              label="Key Prefix"
            >
              <Input placeholder="memory:" />
            </Form.Item>
            <Form.Item
              name={['redis', 'max_history_messages']}
              label="最大历史消息数"
              rules={[{ required: true, message: '请输入最大历史消息数' }]}
            >
              <InputNumber style={{ width: '100%' }} min={1} />
            </Form.Item>
          </>
        )}

        {provider === 'mongodb' && (
          <>
            <Form.Item
              name={['mongodb', 'uri']}
              label="URI"
              rules={[{ required: true, message: '请输入URI' }]}
            >
              <Input placeholder="mongodb://localhost:27017" />
            </Form.Item>
            <Form.Item
              name={['mongodb', 'database']}
              label="Database"
              rules={[{ required: true, message: '请输入Database' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name={['mongodb', 'collection']}
              label="Collection"
              rules={[{ required: true, message: '请输入Collection' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name={['mongodb', 'max_history_messages']}
              label="最大历史消息数"
              rules={[{ required: true, message: '请输入最大历史消息数' }]}
            >
              <InputNumber style={{ width: '100%' }} min={1} />
            </Form.Item>
          </>
        )}
      </Form>
    </Modal>
  );
};
