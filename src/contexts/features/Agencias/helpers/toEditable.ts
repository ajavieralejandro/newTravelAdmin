// contexts/features/Agencias/helpers/toEditable.ts
'use client';

import type { AgenciaBackData } from '@/types/AgenciaBackData';
import type { AgenciaEditable } from '../AgenciaActivaProvider';

/** Convierte BackData → Editable (habilita File | string | null en fileables) */
export function toEditable(data: AgenciaBackData): AgenciaEditable {
  return {
    ...data,
    logo: data.logo ?? null,
    header_imagen_background: data.header_imagen_background ?? null,
    header_video_background: data.header_video_background ?? null,
    terminos_y_condiciones: data.terminos_y_condiciones ?? null,
    publicidad_imagen_1: data.publicidad_imagen_1 ?? null,
    publicidad_imagen_2: data.publicidad_imagen_2 ?? null,
    publicidad_imagen_3: data.publicidad_imagen_3 ?? null,
  };
}
