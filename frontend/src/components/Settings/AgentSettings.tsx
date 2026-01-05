import { Card, Button, Flex } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { useAgentSettings } from '@/hooks/useAgentSettings';
import { AgentSettingModal } from './AgentSettingModal';

export const AgentSettings = () => {
  const { setting, handleEdit, modalVisible, form, handleSubmit, handleCloseModal } = useAgentSettings();

  return (
    <>
      <Card className="content-card">
        <Flex
          align="center"
          justify="space-between"
          gap={20}
          style={{ marginBottom: 16 }}
        >
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={handleEdit}
          >
            编辑Agent配置
          </Button>
        </Flex>
        {setting && (
          <Card size="small" style={{ marginBottom: 16 }}>
            <p><strong>名称:</strong> {setting.name || '未设置'}</p>
            <p><strong>提示词:</strong> {setting.prompt || '未设置'}</p>
            <p><strong>工具列表:</strong> {setting.tools && setting.tools.length > 0 ? setting.tools.join(', ') : '未设置'}</p>
          </Card>
        )}
      </Card>

      <AgentSettingModal
        visible={modalVisible}
        form={form}
        onSubmit={handleSubmit}
        onClose={handleCloseModal}
      />
    </>
  );
};

