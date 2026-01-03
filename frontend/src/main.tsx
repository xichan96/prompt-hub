import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router';
import { ConfigProvider, theme } from 'antd';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import zhCN from 'antd/locale/zh_CN';
import { router } from './router';
import ErrorBoundary from './components/ErrorBoundary';
import { AppInitializer } from './components/AppInitializer';
import './index.css';

import '@ant-design/v5-patch-for-react-19';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 0,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ConfigProvider 
        locale={zhCN}
        theme={{
          algorithm: theme.darkAlgorithm,
        }}
      >
        <QueryClientProvider client={queryClient}>
          <AppInitializer>
            <RouterProvider router={router} />
          </AppInitializer>
        </QueryClientProvider>
      </ConfigProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);

window.addEventListener('error', (event) => {
  if (event.message.includes('Failed to fetch dynamically imported module')) {
    window.location.reload();
  }
});

