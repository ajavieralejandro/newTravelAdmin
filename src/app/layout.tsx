'use client';

import * as React from 'react';
import type { Viewport } from 'next';

import '@/styles/global.css';
import { UserProvider } from '@/contexts/user-context';
import { LocalizationProvider } from '@/components/core/localization-provider';
import { ThemeProvider } from '@/components/core/theme-provider/theme-provider';
import { AgenciasProvider } from '@/contexts/features/Agencias/AgenciaProvider';
import { ModalAgenciaProvider } from '@/contexts/ModalAgenciaProvider';

import { PaquetesPropiosProvider } from '@/contexts/features/PaquetesPropiosProvider/PaquetesPropiosProvider';

import { initMock } from '../lib/init-mock';

export const viewport = { width: 'device-width', initialScale: 1 } satisfies Viewport;

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps): React.JSX.Element {
  React.useEffect(() => {
    console.log('🌐 initMock(): ejecutando');
    initMock();
  }, []);

  return (
    <html lang="en">
      <body>
        <LocalizationProvider>
          <UserProvider>
            <AgenciasProvider>
              <ModalAgenciaProvider>
                                  <PaquetesPropiosProvider>
                    <ThemeProvider>{children}</ThemeProvider>
                  </PaquetesPropiosProvider>
                
              </ModalAgenciaProvider>
            </AgenciasProvider>
          </UserProvider>
        </LocalizationProvider>
      </body>
    </html>
  );
}
