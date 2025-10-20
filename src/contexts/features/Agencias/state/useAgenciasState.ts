import { useState, useCallback } from 'react';
import { AgenciasContextState } from '../../../../types/types';
import { AgenciaBackData } from '@/types/AgenciaBackData';

const useAgenciasState = (initialState?: Partial<AgenciasContextState>) => {
  const [state, setState] = useState<AgenciasContextState>({
    agencias: [],
    loading: false,
    error: null,
    lastUpdated: null,
    ...initialState
  });

  // --- Optimistic Update Functions --- //
  const addTempAgencia = useCallback((tempAgencia: Omit<AgenciaBackData, 'idAgencia'>) => {
    const tempId = `temp-${Date.now()}`; // ID temporal tipo string

    const agenciaConId: AgenciaBackData = {
      ...tempAgencia,
      idAgencia: tempId,
      estado: tempAgencia.estado ?? true // Valor por defecto si no está definido
    };

    setState(prev => ({
      ...prev,
      agencias: [...prev.agencias, agenciaConId],
      loading: true
    }));

    return tempId;
  }, []);

  const confirmAgencia = useCallback((tempId: string, realAgencia: AgenciaBackData) => {
    setState(prev => ({
      ...prev,
      agencias: prev.agencias.map(a =>
        a.idAgencia === tempId ? realAgencia : a
      ),
      loading: false,
      lastUpdated: new Date()
    }));
  }, []);

  const revertTempAgencia = useCallback((tempId: string, error?: string) => {
    setState(prev => ({
      ...prev,
      agencias: prev.agencias.filter(a => a.idAgencia !== tempId),
      loading: false,
      error: error || prev.error
    }));
  }, []);

  // --- Basic Setters --- //
  const setAgencias = useCallback((agencias: AgenciaBackData[]) => {
    setState(prev => ({
      ...prev,
      agencias,
      lastUpdated: new Date()
    }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const setLastUpdated = useCallback(() => {
    setState(prev => ({ ...prev, lastUpdated: new Date() }));
  }, []);

  return {
    state,
    // Optimistic Update API
    addTempAgencia,
    confirmAgencia,
    revertTempAgencia,
    // Basic Setters
    setAgencias,
    setLoading,
    setError,
    setLastUpdated
  };
};

export default useAgenciasState;

