// contexts/features/Agencias/AgenciaProvider.tsx
'use client';

import React, { createContext, useContext, useMemo } from 'react';
import useAgenciasState from './state/useAgenciasState';
import useAgenciasActions from './actions/useAgenciasActions';
import useAgenciasQueries from './queries/useAgenciasQueries';
import type { AgenciasContextState } from '../../../types/types';
import type { AgenciaBackData } from '@/types/AgenciaBackData';

interface AgenciasContextType {
  state: AgenciasContextState;
  actions: {
    fetchAgencias: () => Promise<boolean>;
    deleteAgencia: (id: string) => Promise<{ success: boolean; error?: string }>;
  };
  queries: {
    getAgenciaById: (id: string) => AgenciaBackData | undefined;
    filterAgencias: (criterios: Partial<AgenciaBackData>) => AgenciaBackData[];
  };
}

const AgenciasContext = createContext<AgenciasContextType | undefined>(undefined);

export const AgenciasProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    state,
    setAgencias,
    setLoading,
    setError,
    setLastUpdated,
    // ⛔️ quitamos helpers optimistas no usados en esta fase
    // addTempAgencia,
    // confirmAgencia,
    // revertTempAgencia,
  } = useAgenciasState();

  const stableStateMethods = useMemo(
    () => ({
      setAgencias,
      setLoading,
      setError,
      setLastUpdated,
    }),
    [setAgencias, setLoading, setError, setLastUpdated]
  );

  // Hook de acciones reducido (listar + eliminar)
  const actionsCore = useAgenciasActions(state, stableStateMethods);
  const queries = useAgenciasQueries(state.agencias);

  const contextValue = useMemo<AgenciasContextType>(
    () => ({
      state,
      actions: {
        fetchAgencias: actionsCore.fetchAgencias,
        deleteAgencia: actionsCore.deleteAgencia, // id: string
      },
      queries,
    }),
    [state, actionsCore, queries]
  );

  return <AgenciasContext.Provider value={contextValue}>{children}</AgenciasContext.Provider>;
};

export const useAgenciasContext = (): AgenciasContextType => {
  const context = useContext(AgenciasContext);
  if (!context) {
    throw new Error('useAgenciasContext must be used within an AgenciasProvider');
  }
  return context;
};
