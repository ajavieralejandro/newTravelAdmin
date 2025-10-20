// src/components/form/hooks/useSubmitAgencia.ts
'use client';

import { mapFormToPayload } from '@/contexts/features/Agencias/services/agenciaMapper';
import { agenciasService } from '@/contexts/features/Agencias/services/agenciasService';
import type { AgenciaFormValues } from '@/contexts/features/Agencias/services/agenciaMapper';
import type { AgenciaBackData } from '@/types/AgenciaBackData';

type AgenciaId = { id: number };

type SubmitOk = {
  success: true;
  agencia?: AgenciaBackData;
};

type SubmitErr = {
  success: false;
  message?: string;
  fieldErrors?: Record<string, string[]>;
};

export const useSubmitAgencia = (datosEdicion?: AgenciaId) => {
  const submitAgencia = async (values: AgenciaFormValues): Promise<SubmitOk | SubmitErr> => {
    console.group('[useSubmitAgencia] submit');

    try {
      if (!values || Object.keys(values).length === 0) {
        throw new Error('Datos del formulario vacíos');
      }

      const payload = mapFormToPayload(values);
      const isEdit = typeof datosEdicion?.id === 'number' && !Number.isNaN(datosEdicion.id);

      if (isEdit) {
        // UPDATE
        const idStr = String(datosEdicion!.id);
        const resp = await agenciasService.update(idStr, payload); // resp: { success, data?, error? }
        console.log('[useSubmitAgencia] update resp:', resp);

        if (!resp?.success) {
          return {
            success: false,
            message: resp?.error || 'Error al actualizar la agencia',
            // fieldErrors: resp?.fieldErrors // <- si el service los expone, propágalos aquí
          };
        }

        // Refetch para obtener la entidad tipada completa
        let agencia: AgenciaBackData | undefined;
        try {
          agencia = await agenciasService.getById(idStr);
        } catch (e) {
          console.warn('[useSubmitAgencia] Update OK, pero no se pudo obtener la agencia por ID:', e);
        }

        console.groupEnd();
        return { success: true, agencia };
      }

      // CREATE
      const createResp = await agenciasService.create(payload); // { success, id?, data?, error? }
      console.log('[useSubmitAgencia] create resp:', createResp);

      if (!createResp?.success) {
        return {
          success: false,
          message: createResp?.error || 'Error al crear la agencia',
        };
      }

      let agenciaCreada: AgenciaBackData | undefined;
      if (typeof createResp.id !== 'undefined') {
        try {
          agenciaCreada = await agenciasService.getById(String(createResp.id));
        } catch (e) {
          console.warn('[useSubmitAgencia] Create OK, pero no se pudo obtener la agencia por ID:', e);
        }
      }

      console.groupEnd();
      return { success: true, agencia: agenciaCreada };
    } catch (err) {
      console.error('[useSubmitAgencia] error:', err);
      console.groupEnd();
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Fallo desconocido',
      };
    }
  };

  return submitAgencia;
};
