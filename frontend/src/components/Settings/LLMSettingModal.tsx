import { Modal, Form, Input, Select, FormInstance } from 'antd';
import { UpdateLLMSettingRequest } from '@/apis/setting';

interface LLMSettingModalProps {
  visible: boolean;
  form: FormInstance;
  onSubmit: (values: UpdateLLMSettingRequest) => void;
  onClose: () => void;
}

export const LLMSettingModal = ({ visible, form, onSubmit, onClose }: LLMSettingModalProps) => {
  return (
    <Modal
      title="编辑LLM配置"
      open={visible}
      onCancel={onClose}
      onOk={() => form.submit()}
      width={800}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmit}
      >
        <Form.Item
          name="provider"
          label="提供商"
          rules={[{ required: true, message: '请选择提供商' }]}
        >
          <Select placeholder="请选择提供商">
            <Select.Option value="openai">OpenAI</Select.Option>
            <Select.Option value="deepseek">DeepSeek</Select.Option>
            <Select.Option value="volce">Volce</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.provider !== currentValues.provider}>
          {({ getFieldValue }) => {
            const provider = getFieldValue('provider');
            return (
              <>
                {provider === 'openai' && (
                  <>
                    <Form.Item
                      name={['openai', 'api_key']}
                      label="API Key"
                      rules={[{ required: true, message: '请输入API Key' }]}
                    >
                      <Input.Password placeholder="请输入API Key" />
                    </Form.Item>
                    <Form.Item
                      name={['openai', 'base_url']}
                      label="Base URL"
                      rules={[{ required: true, message: '请输入Base URL' }]}
                    >
                      <Input placeholder="请输入Base URL" />
                    </Form.Item>
                    <Form.Item
                      name={['openai', 'model']}
                      label="Model"
                      rules={[{ required: true, message: '请输入Model' }]}
                    >
                      <Input placeholder="请输入Model" />
                    </Form.Item>
                    <Form.Item
                      name={['openai', 'org_id']}
                      label="Org ID"
                    >
                      <Input placeholder="请输入Org ID" />
                    </Form.Item>
                    <Form.Item
                      name={['openai', 'api_type']}
                      label="API Type"
                      rules={[{ required: true, message: '请输入API Type' }]}
                    >
                      <Input placeholder="请输入API Type" />
                    </Form.Item>
                  </>
                )}

                {provider === 'deepseek' && (
                  <>
                    <Form.Item
                      name={['deepseek', 'api_key']}
                      label="API Key"
                      rules={[{ required: true, message: '请输入API Key' }]}
                    >
                      <Input.Password placeholder="请输入API Key" />
                    </Form.Item>
                    <Form.Item
                      name={['deepseek', 'base_url']}
                      label="Base URL"
                      rules={[{ required: true, message: '请输入Base URL' }]}
                    >
                      <Input placeholder="请输入Base URL" />
                    </Form.Item>
                    <Form.Item
                      name={['deepseek', 'model']}
                      label="Model"
                      rules={[{ required: true, message: '请输入Model' }]}
                    >
                      <Input placeholder="请输入Model" />
                    </Form.Item>
                  </>
                )}

                {provider === 'volce' && (
                  <>
                    <Form.Item
                      name={['volce', 'api_key']}
                      label="API Key"
                      rules={[{ required: true, message: '请输入API Key' }]}
                    >
                      <Input.Password placeholder="请输入API Key" />
                    </Form.Item>
                    <Form.Item
                      name={['volce', 'base_url']}
                      label="Base URL"
                    >
                      <Input placeholder="请输入Base URL" />
                    </Form.Item>
                    <Form.Item
                      name={['volce', 'model']}
                      label="Model"
                    >
                      <Input placeholder="请输入Model" />
                    </Form.Item>
                  </>
                )}
              </>
            );
          }}
        </Form.Item>
      </Form>
    </Modal>
  );
};

