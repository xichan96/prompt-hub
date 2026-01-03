import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store';
import { PageLoading } from './Loading';

interface AppInitializerProps {
  children: React.ReactNode;
}

export const AppInitializer: React.FC<AppInitializerProps> = ({ children }) => {
  const [initializing, setInitializing] = useState(true);
  const { validateToken } = useAuthStore();

  useEffect(() => {
    const init = async () => {
      await validateToken();
      setInitializing(false);
    };
    init();
  }, [validateToken]);

  if (initializing) {
    return <PageLoading tip="初始化中..." />;
  }

  return <>{children}</>;
};

