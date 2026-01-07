import { ConfigProvider, theme as antTheme } from 'antd';
import { useThemeStore } from '@/store';
import { useEffect } from 'react';
import zhCN from 'antd/locale/zh_CN';
import { HighlightStyle } from './HighlightStyle';

export const ThemeConfigProvider = ({ children }: { children: React.ReactNode }) => {
  const { theme } = useThemeStore();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: theme === 'dark' ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
        token: {
          colorBorderSecondary: theme === 'dark' ? '#434343' : '#d9d9d9',
        },
      }}
    >
      <HighlightStyle />
      {children}
    </ConfigProvider>
  );
};
