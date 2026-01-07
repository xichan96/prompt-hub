import { Card, Button, Flex, Descriptions } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { useMemorySettings } from '@/hooks/useMemorySettings';
import { MemorySettingModal } from './MemorySettingModal';
import { useI18n } from '@/hooks/useI18n';

export const MemorySettings = () => {
  const { setting, handleEdit, modalVisible, form, handleSubmit, handleCloseModal } = useMemorySettings();
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
            {t('memory.editConfigModal', '编辑Memory配置')}
          </Button>
        </Flex>
        {setting && (
          <Card size="small" style={{ marginBottom: 16 }}>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label={t('memory.provider', 'Memory Provider')}>{setting.provider}</Descriptions.Item>
              
              {setting.provider === 'simple' && (
                <>
                  <Descriptions.Item label={t('memory.simple.maxHistory', '最大历史消息数')}>{setting.simple?.max_history_messages}</Descriptions.Item>
                </>
              )}

              {setting.provider === 'redis' && (
                <>
                  <Descriptions.Item label={t('common.host', 'Host')}>{setting.redis?.host}</Descriptions.Item>
                  <Descriptions.Item label={t('common.port', 'Port')}>{setting.redis?.port}</Descriptions.Item>
                  <Descriptions.Item label={t('common.username', 'Username')}>{setting.redis?.username || '-'}</Descriptions.Item>
                  <Descriptions.Item label={t('memory.redis.db', 'DB')}>{setting.redis?.db}</Descriptions.Item>
                  <Descriptions.Item label="Key Prefix">{setting.redis?.key_prefix || '-'}</Descriptions.Item>
                  <Descriptions.Item label="最大历史消息数">{setting.redis?.max_history_messages}</Descriptions.Item>
                </>
              )}

              {setting.provider === 'mongodb' && (
                <>
                  <Descriptions.Item label="URI">{setting.mongodb?.uri}</Descriptions.Item>
                  <Descriptions.Item label="Database">{setting.mongodb?.database}</Descriptions.Item>
                  <Descriptions.Item label="Collection">{setting.mongodb?.collection}</Descriptions.Item>
                  <Descriptions.Item label="最大历史消息数">{setting.mongodb?.max_history_messages}</Descriptions.Item>
                </>
              )}
            </Descriptions>
          </Card>
        )}
      </Card>

      <MemorySettingModal
        visible={modalVisible}
        form={form}
        onSubmit={handleSubmit}
        onClose={handleCloseModal}
      />
    </>
  );
};
