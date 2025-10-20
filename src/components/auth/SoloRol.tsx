'use client';

import React from 'react';
import { useUserContext } from '@/contexts/user-context';

interface SoloRolProps {
  rol: 'admin' | 'superadmin';
  children: React.ReactNode;
}

export const SoloRol: React.FC<SoloRolProps> = ({ rol, children }) => {
  const { user, isLoading } = useUserContext();

  if (isLoading) return null;

  if (!user || user.rol !== rol) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>
        <p style={{ fontSize: '1.2rem' }}>🚫 Acceso no autorizado</p>
        <p>Esta sección está reservada para el rol: <strong>{rol}</strong>.</p>
      </div>
    );
  }

  return <>{children}</>;
};

