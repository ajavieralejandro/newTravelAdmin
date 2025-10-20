// src/components/form/hooks/useAgenciaForm.ts
'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

import { useModalAgenciaGlobal } from '@/contexts/ModalAgenciaProvider';
import { mapBackToForm } from '@/contexts/features/Agencias/services/agenciaMapper';
import { createEmptyAgenciaBackData } from '@/contexts/features/Agencias/services/agenciaStore';

import type { AgenciaFormValues } from '@/contexts/features/Agencias/services/agenciaMapper';
import type { AgenciaBackData } from '@/types/AgenciaBackData';

export interface UrlsAgencia {
  logoUrl?: string;
  headerImagenUrl?: string;
  headerVideoUrl?: string;
  publicidadUrls?: [string?, string?, string?];
  terminosUrl?: string;
}

export const useAgenciaForm = () => {
  const { datosEdicion, isOpen } = useModalAgenciaGlobal(); // crear: undefined, editar: AgenciaBackData
  const [isResetDone, setIsResetDone] = useState(false);
  const urlsRef = useRef<UrlsAgencia | null>(null);

  // Defaults 100% desde mapper
  const methods = useForm<AgenciaFormValues>({
    mode: 'onChange',
    shouldUnregister: false,
    defaultValues: mapBackToForm(createEmptyAgenciaBackData()),
  });

  const { reset, setValue } = methods;

  // Al abrir modal, permitir un nuevo reset
  useEffect(() => {
    if (isOpen) setIsResetDone(false);
  }, [isOpen]);

  // Hidratación (BackData -> FormValues)
  useEffect(() => {
    if (!isOpen || isResetDone) return;

    const source: AgenciaBackData = datosEdicion ?? createEmptyAgenciaBackData();
    const formValues = mapBackToForm(source);

    reset(formValues);

    // Política de archivos: si no hay cambio, enviar null
    setValue('logo', null);
    setValue('header_imagen_background', null);
    setValue('header_video_background', null);
    setValue('publicidad_imagen_1', null);
    setValue('publicidad_imagen_2', null);
    setValue('publicidad_imagen_3', null);
    setValue('terminos_y_condiciones', null);

    // URLs para previsualización (solo en editar)
    if (datosEdicion) {
      urlsRef.current = {
        logoUrl: datosEdicion.logo ?? undefined,
        headerImagenUrl: datosEdicion.header_imagen_background ?? undefined,
        headerVideoUrl: datosEdicion.header_video_background ?? undefined,
        publicidadUrls: [
          datosEdicion.publicidad_imagen_1 ?? undefined,
          datosEdicion.publicidad_imagen_2 ?? undefined,
          datosEdicion.publicidad_imagen_3 ?? undefined,
        ],
        terminosUrl: datosEdicion.terminos_y_condiciones ?? undefined,
      };
    } else {
      urlsRef.current = null;
    }

    setIsResetDone(true);
  }, [datosEdicion, isOpen, isResetDone, reset, setValue]);

  return {
    ...methods,
    urlsAgencia: urlsRef.current,
  };
};
