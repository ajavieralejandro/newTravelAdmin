// contexts/features/Agencias/actions/useAgenciasActions.ts
import { useCallback } from 'react';
import { deleteAgencia as deleteAgenciaAction } from './deleteAgencia';
import { agenciasService } from '../services/agenciasService';
import type { AgenciasContextState } from '../../../../types/types';
import type { AgenciaBackData } from '@/types/AgenciaBackData';

const useAgenciasActions = (
  state: AgenciasContextState,
  stateMethods: {
    setAgencias: (agencias: AgenciaBackData[]) => void;
    setError: (error: string | null) => void;
    setLoading?: (v: boolean) => void;
    setLastUpdated?: (d: Date) => void;
  }
) => {
  // Listar agencias desde el service y refrescar el estado
  const cargarAgencias = useCallback(async (): Promise<boolean> => {
    try {
      stateMethods.setLoading?.(true);
      const data = await agenciasService.list();
      stateMethods.setAgencias(data);
      stateMethods.setLastUpdated?.(new Date());
      return true;
    } catch (error) {
      stateMethods.setError(error instanceof Error ? error.message : 'Error desconocido');
      return false;
    } finally {
      stateMethods.setLoading?.(false);
    }
  }, [stateMethods]);

  // Eliminar agencia por id (string consistente con AgenciaBackData)
  const handleDeleteAgencia = useCallback(
    async (id: string): Promise<{ success: boolean; error?: string }> => {
      try {
        const result = await deleteAgenciaAction(id, {
          setError: stateMethods.setError,
        });

        if (!result.success) {
          return { success: false, error: result.error };
        }

        // Actualizamos cache local sin refetch (fase actual)
        const agenciasActualizadas = state.agencias.filter((a) => a.idAgencia !== id);
        stateMethods.setAgencias(agenciasActualizadas);
        stateMethods.setLastUpdated?.(new Date());

        return { success: true };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Error desconocido';
        stateMethods.setError(message);
        return { success: false, error: message };
      }
    },
    [state, stateMethods]
  );

  return {
    fetchAgencias: cargarAgencias,
    deleteAgencia: handleDeleteAgencia,
  };
};

export default useAgenciasActions;
