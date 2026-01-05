import { Tabs } from 'antd';
import Page from '@/components/Page';
import { GeneralSettings, LLMSettings, AgentSettings, MemorySettings } from '@/components/Settings';

export default function Settings() {
  return (
    <Page title="系统设置" description="管理系统配置项">
      <Tabs
        defaultActiveKey="general"
        items={[
          {
            key: 'general',
            label: '通用配置',
            children: <GeneralSettings />,
          },
          {
            key: 'llm',
            label: 'LLM配置',
            children: <LLMSettings />,
          },
          {
            key: 'agent',
            label: 'Agent配置',
            children: <AgentSettings />,
          },
          {
            key: 'memory',
            label: 'Memory配置',
            children: <MemorySettings />,
          },
        ]}
      />
    </Page>
  );
}

