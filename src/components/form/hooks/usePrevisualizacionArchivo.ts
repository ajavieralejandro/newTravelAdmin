// src/components/form/hooks/usePrevisualizacionArchivo.ts
'use client';

import { useEffect, useState, useCallback } from 'react';
import { UseFormSetValue } from 'react-hook-form';

interface UsePrevisualizacionArchivoParams {
  campo: string;
  archivo: File | string | null | undefined;
  urlOriginal: string | null;
  setValue: UseFormSetValue<any>;
}

export const usePrevisualizacionArchivo = ({
  campo,
  archivo,
  urlOriginal,
  setValue
}: UsePrevisualizacionArchivoParams) => {
  const [urlPreview, setUrlPreview] = useState<string | null>(urlOriginal ?? null);

  useEffect(() => {
    console.log('[usePrevisualizacionArchivo] ▶️ Ejecutando efecto con:', {
      campo,
      archivo,
      urlOriginal
    });

    if (archivo instanceof File) {
      console.log('[usePrevisualizacionArchivo] 🟩 Archivo es File → creando URL temporal');
      const objectUrl = URL.createObjectURL(archivo);
      setUrlPreview(objectUrl);
      setValue(campo, archivo);

      return () => URL.revokeObjectURL(objectUrl);
    }

    if (!archivo && urlOriginal) {
      console.log('[usePrevisualizacionArchivo] 🟦 No hay archivo nuevo, usando urlOriginal');
      setUrlPreview(urlOriginal);
      return;
    }

    if (typeof archivo === 'string') {
      console.log('[usePrevisualizacionArchivo] 🟨 Archivo es string, usándolo como preview');
      setUrlPreview(archivo);
      return;
    }

    console.warn('[usePrevisualizacionArchivo] ⚠️ No se detectó fuente válida para preview');

  }, [archivo, urlOriginal, campo, setValue]);

  const manejarCambio = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const nuevoArchivo = e.target.files?.[0] ?? null;
      console.log('[usePrevisualizacionArchivo] 📤 Cambio detectado:', nuevoArchivo);
      setValue(campo, nuevoArchivo);
    },
    [campo, setValue]
  );

  const limpiarArchivo = useCallback(() => {
    console.log('[usePrevisualizacionArchivo] 🧹 Limpiando archivo');
    setValue(campo, null);
    setUrlPreview(urlOriginal ?? null);
  }, [campo, setValue, urlOriginal]);

  return {
    urlPreview,
    manejarCambio,
    limpiarArchivo
  };
};
