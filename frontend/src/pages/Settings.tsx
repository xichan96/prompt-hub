import { Tabs } from 'antd';
import Page from '@/components/Page';
import { GeneralSettings, LLMSettings, AgentSettings, MemorySettings } from '@/components/Settings';
import { useI18n } from '@/hooks/useI18n';

export default function Settings() {
  const { t } = useI18n();
  return (
    <Page title={t('settings.title', '系统设置')} description={t('settings.description', '管理系统配置项')}>
      <Tabs
        defaultActiveKey="general"
        items={[
          {
            key: 'general',
            label: t('settings.tab.general', '通用配置'),
            children: <GeneralSettings />,
          },
          {
            key: 'llm',
            label: t('settings.tab.llm', 'LLM配置'),
            children: <LLMSettings />,
          },
          {
            key: 'agent',
            label: t('settings.tab.agent', 'Agent配置'),
            children: <AgentSettings />,
          },
          {
            key: 'memory',
            label: t('settings.tab.memory', 'Memory配置'),
            children: <MemorySettings />,
          },
        ]}
      />
    </Page>
  );
}
