'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from '@/paths';
import { logger } from '@/lib/default-logger';
import { useUserContext } from '@/contexts/user-context';

export interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps): React.JSX.Element | null {
  const router = useRouter();
  const { user, error, isLoading } = useUserContext();
  const [isChecking, setIsChecking] = React.useState<boolean>(true);

  const checkPermissions = async (): Promise<void> => {
    if (isLoading) return;

    if (error && !error.toLowerCase().includes('token')) {
      logger.error('[AuthGuard] Error crítico:', error);
      setIsChecking(false);
      return;
    }

    if (!user) {
      logger.debug('[AuthGuard]: Usuario no logueado → redireccionando a login');
      router.replace(paths.auth.signIn);
      return;
    }

    setIsChecking(false);
  };

  React.useEffect(() => {
    checkPermissions().catch((e) => logger.error(e));
  }, [user, error, isLoading]);

  if (isChecking || isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '100px' }}>
        <CircularProgress />
      </div>
    );
  }

  if (error && !error.toLowerCase().includes('token')) {
    return <Alert color="error">Ocurrió un error inesperado</Alert>;
  }

  return <>{children}</>;
}

