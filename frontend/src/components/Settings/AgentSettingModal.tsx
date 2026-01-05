import { Modal, Form, Input, Select, FormInstance } from 'antd';
import { UpdateAgentSettingRequest } from '@/apis/setting';

interface AgentSettingModalProps {
  visible: boolean;
  form: FormInstance;
  onSubmit: (values: UpdateAgentSettingRequest) => void;
  onClose: () => void;
}

export const AgentSettingModal = ({ visible, form, onSubmit, onClose }: AgentSettingModalProps) => {
  return (
    <Modal
      title="编辑Agent配置"
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
          name="name"
          label="名称"
        >
          <Input placeholder="请输入Agent名称" />
        </Form.Item>
        <Form.Item
          name="prompt"
          label="提示词"
        >
          <Input.TextArea placeholder="请输入Agent提示词" rows={6} />
        </Form.Item>
        <Form.Item
          name="tools"
          label="工具列表 (MCP)"
          rules={[
            {
              validator: (_, value) => {
                if (!value || value.length === 0) {
                  return Promise.resolve();
                }
                const urlPattern = /^https?:\/\/.+/;
                const invalidUrls = value.filter((url: string) => !urlPattern.test(url));
                if (invalidUrls.length > 0) {
                  return Promise.reject(new Error('请输入有效的 URL 链接（以 http:// 或 https:// 开头）'));
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <Select
            mode="tags"
            placeholder="请输入 MCP 工具链接（URL），按回车添加"
            style={{ width: '100%' }}
            tokenSeparators={[',']}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

