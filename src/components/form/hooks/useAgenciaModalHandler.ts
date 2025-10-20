// src/components/form/hooks/useAgenciaModalHandler.ts
'use client';

import { useCallback, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useModalAgenciaGlobal } from '@/contexts/ModalAgenciaProvider';
import { useSubmitAgencia } from './useSubmitAgencia';
import { mapBackToForm } from '@/contexts/features/Agencias/services/agenciaMapper';
import { createEmptyAgenciaBackData } from '@/contexts/features/Agencias/services/agenciaStore';
import { useAgenciasContext } from '@/contexts/features/Agencias/AgenciaProvider';
import type { AgenciaFormValues } from '@/contexts/features/Agencias/services/agenciaMapper';

type SubmitResult = {
  success: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
};

export const useAgenciaModalHandler = () => {
  const [submissionState, setSubmissionState] = useState<{
    status: 'idle' | 'loading' | 'success' | 'error';
    message?: string;
  }>({ status: 'idle' });

  const { actions } = useAgenciasContext();
  const { closeModal, datosEdicion } = useModalAgenciaGlobal();
  const { reset, getValues, setError } = useFormContext<AgenciaFormValues>();

  const isEdit = Boolean(datosEdicion);

  const numericId =
    isEdit && datosEdicion?.idAgencia !== null
      ? Number(datosEdicion.idAgencia)
      : undefined;

  const submitAgencia = useSubmitAgencia(
    typeof numericId === 'number' && !Number.isNaN(numericId)
      ? { id: numericId }
      : undefined
  );

  const handleSubmitClick = useCallback(async () => {
    console.groupCollapsed('[Modal] Inicio del proceso de envío');

    try {
      const formDataValues = getValues();

      if (isEdit) {
        const confirm = window.confirm(
          `¿Seguro que desea modificar los datos de ${formDataValues.nombre}?`
        );
        if (!confirm) return;
      }

      setSubmissionState({ status: 'loading', message: 'Enviando datos...' });

      const result = (await submitAgencia(formDataValues)) as SubmitResult;

      if (!result.success) {
        if (result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([field, messages]) => {
            if (!field) return;
            setError(field as keyof AgenciaFormValues, {
              type: 'server',
              message: messages?.[0] ?? 'Campo inválido',
            });
          });
        }
        throw new Error(result.message ?? 'Error al guardar los datos de la agencia');
      }

      // ✅ Refetch para que la tabla se actualice con la nueva/actualizada agencia
      try {
        await actions.fetchAgencias();
      } catch (e) {
        console.warn('[Modal] fetchAgencias falló tras submit:', e);
      }

      setSubmissionState({ status: 'success', message: '¡Datos guardados correctamente!' });

      setTimeout(() => {
        reset(mapBackToForm(createEmptyAgenciaBackData()));
        closeModal();
        setSubmissionState({ status: 'idle' });
      }, 1200);
    } catch (error) {
      console.error('[Modal] ❌ Error al enviar la agencia:', error);
      setSubmissionState({
        status: 'error',
        message: error instanceof Error ? error.message : 'Error desconocido al guardar',
      });

      setTimeout(() => {
        setSubmissionState({ status: 'idle' });
      }, 2800);
    } finally {
      console.groupEnd();
    }
  }, [isEdit, getValues, reset, closeModal, setError, submitAgencia, actions]);

  return {
    submissionState,
    handleSubmitClick,
  };
};
