import { Card, Button, Flex } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { useLLMSettings } from '@/hooks/useLLMSettings';
import { LLMSettingModal } from './LLMSettingModal';
import { useI18n } from '@/hooks/useI18n';

export const LLMSettings = () => {
  const { setting, handleEdit, modalVisible, form, handleSubmit, handleCloseModal } = useLLMSettings();
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
            {t('llm.editConfig', '编辑LLM配置')}
          </Button>
        </Flex>
        {setting && (
          <Card size="small" style={{ marginBottom: 16 }}>
            <p><strong>{t('llm.currentProvider', '当前提供商:')}</strong> {setting.provider}</p>
            {setting.provider === 'openai' && (
              <div>
                <p><strong>Base URL:</strong> {setting.openai.base_url}</p>
                <p><strong>Model:</strong> {setting.openai.model}</p>
                <p><strong>API Type:</strong> {setting.openai.api_type}</p>
              </div>
            )}
            {setting.provider === 'deepseek' && (
              <div>
                <p><strong>Base URL:</strong> {setting.deepseek.base_url}</p>
                <p><strong>Model:</strong> {setting.deepseek.model}</p>
              </div>
            )}
            {setting.provider === 'volce' && (
              <div>
                <p><strong>Base URL:</strong> {setting.volce.base_url || t('common.notSet', '未设置')}</p>
                <p><strong>Model:</strong> {setting.volce.model || t('common.notSet', '未设置')}</p>
              </div>
            )}
          </Card>
        )}
      </Card>

      <LLMSettingModal
        visible={modalVisible}
        form={form}
        onSubmit={handleSubmit}
        onClose={handleCloseModal}
      />
    </>
  );
};
