import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store';
import { PageLoading } from './Loading';
import { useI18n } from '@/hooks/useI18n';

interface AppInitializerProps {
  children: React.ReactNode;
}

export const AppInitializer: React.FC<AppInitializerProps> = ({ children }) => {
  const [initializing, setInitializing] = useState(true);
  const { validateToken } = useAuthStore();
  const { t } = useI18n();

  useEffect(() => {
    const init = async () => {
      await validateToken();
      setInitializing(false);
    };
    init();
  }, [validateToken]);

  if (initializing) {
    return <PageLoading tip={t('app.initializing', '初始化中...')} />;
  }

  return <>{children}</>;
};
