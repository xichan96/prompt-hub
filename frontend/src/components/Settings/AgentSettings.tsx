import { Card, Button, Flex } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { useAgentSettings } from '@/hooks/useAgentSettings';
import { AgentSettingModal } from './AgentSettingModal';
import { useI18n } from '@/hooks/useI18n';

export const AgentSettings = () => {
  const { setting, handleEdit, modalVisible, form, handleSubmit, handleCloseModal } = useAgentSettings();
  const { t } = useI18n();

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
            {t('agent.editConfigModal', '编辑Agent配置')}
          </Button>
        </Flex>
        {setting && (
          <Card size="small" style={{ marginBottom: 16 }}>
            <p><strong>{t('common.name', '名称')}:</strong> {setting.name || t('common.notSet', '未设置')}</p>
            <p><strong>{t('agent.prompt', '提示词')}:</strong> {setting.prompt || t('common.notSet', '未设置')}</p>
            <p><strong>{t('agent.tools', '工具列表 (MCP)')}:</strong> {setting.tools && setting.tools.length > 0 ? setting.tools.join(', ') : t('common.notSet', '未设置')}</p>
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
