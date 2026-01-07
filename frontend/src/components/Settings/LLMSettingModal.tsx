import { Modal, Form, Input, Select, FormInstance } from 'antd';
import { UpdateLLMSettingRequest } from '@/apis/setting';
import { useI18n } from '@/hooks/useI18n';

interface LLMSettingModalProps {
  visible: boolean;
  form: FormInstance;
  onSubmit: (values: UpdateLLMSettingRequest) => void;
  onClose: () => void;
}

export const LLMSettingModal = ({ visible, form, onSubmit, onClose }: LLMSettingModalProps) => {
  const { t } = useI18n();
  return (
    <Modal
      title={t('llm.editConfig', '编辑LLM配置')}
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
          label={t('llm.provider', '提供商')}
          rules={[{ required: true, message: t('llm.providerRequired', '请选择提供商') }]}
        >
          <Select placeholder={t('llm.providerSelectPlaceholder', '请选择提供商')}>
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
                      label={t('common.apiKey', 'API Key')}
                      rules={[{ required: true, message: t('common.apiKeyRequired', '请输入API Key') }]}
                    >
                      <Input.Password placeholder={t('common.apiKeyRequired', '请输入API Key')} />
                    </Form.Item>
                    <Form.Item
                      name={['openai', 'base_url']}
                      label={t('common.baseUrl', 'Base URL')}
                      rules={[{ required: true, message: t('common.baseUrlRequired', '请输入Base URL') }]}
                    >
                      <Input placeholder={t('common.baseUrlRequired', '请输入Base URL')} />
                    </Form.Item>
                    <Form.Item
                      name={['openai', 'model']}
                      label={t('common.model', 'Model')}
                      rules={[{ required: true, message: t('common.modelRequired', '请输入Model') }]}
                    >
                      <Input placeholder={t('common.modelRequired', '请输入Model')} />
                    </Form.Item>
                    <Form.Item
                      name={['openai', 'org_id']}
                      label={t('llm.orgId', 'Org ID')}
                    >
                      <Input placeholder={t('llm.orgIdPlaceholder', '请输入Org ID')} />
                    </Form.Item>
                    <Form.Item
                      name={['openai', 'api_type']}
                      label={t('llm.apiType', 'API Type')}
                      rules={[{ required: true, message: t('llm.apiTypeRequired', '请输入API Type') }]}
                    >
                      <Input placeholder={t('llm.apiTypeRequired', '请输入API Type')} />
                    </Form.Item>
                  </>
                )}

                {provider === 'deepseek' && (
                  <>
                    <Form.Item
                      name={['deepseek', 'api_key']}
                      label={t('common.apiKey', 'API Key')}
                      rules={[{ required: true, message: t('common.apiKeyRequired', '请输入API Key') }]}
                    >
                      <Input.Password placeholder={t('common.apiKeyRequired', '请输入API Key')} />
                    </Form.Item>
                    <Form.Item
                      name={['deepseek', 'base_url']}
                      label={t('common.baseUrl', 'Base URL')}
                      rules={[{ required: true, message: t('common.baseUrlRequired', '请输入Base URL') }]}
                    >
                      <Input placeholder={t('common.baseUrlRequired', '请输入Base URL')} />
                    </Form.Item>
                    <Form.Item
                      name={['deepseek', 'model']}
                      label={t('common.model', 'Model')}
                      rules={[{ required: true, message: t('common.modelRequired', '请输入Model') }]}
                    >
                      <Input placeholder={t('common.modelRequired', '请输入Model')} />
                    </Form.Item>
                  </>
                )}

                {provider === 'volce' && (
                  <>
                    <Form.Item
                      name={['volce', 'api_key']}
                      label={t('common.apiKey', 'API Key')}
                      rules={[{ required: true, message: t('common.apiKeyRequired', '请输入API Key') }]}
                    >
                      <Input.Password placeholder={t('common.apiKeyRequired', '请输入API Key')} />
                    </Form.Item>
                    <Form.Item
                      name={['volce', 'base_url']}
                      label={t('common.baseUrl', 'Base URL')}
                    >
                      <Input placeholder={t('common.baseUrlRequired', '请输入Base URL')} />
                    </Form.Item>
                    <Form.Item
                      name={['volce', 'model']}
                      label={t('common.model', 'Model')}
                    >
                      <Input placeholder={t('common.modelRequired', '请输入Model')} />
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
