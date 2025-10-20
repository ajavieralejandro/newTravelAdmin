// services/agenciasService.ts
'use client';

import type { AgenciaBackData } from '@/types/AgenciaBackData';
import type { AgenciaPayloadBackend } from './agenciaMapper';

function buildAgenciaFormData(payload: AgenciaPayloadBackend): FormData {
  const fd = new FormData();

  Object.entries(payload).forEach(([key, raw]) => {
    const value = raw as unknown;
    if (value === null || value === undefined) return;

    if (value instanceof File) {
      fd.append(key, value);
      return;
    }

    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      fd.append(key, String(value));
      return;
    }

    if (Array.isArray(value) || typeof value === 'object') {
      fd.append(key, JSON.stringify(value));
      return;
    }

    fd.append(key, String(value));
  });

  return fd;
}

export const agenciasService = {
  /** 4) Obtener agencias (GET) */
  async list(): Promise<AgenciaBackData[]> {
    const endpoint = 'https://travelconnect.com.ar/get_agencias';

    const res = await fetch(endpoint, { method: 'GET' });
    console.log('🔎 [agenciasService.list] status:', res.status);

    const raw = await res.text();
    console.log('🧾 [agenciasService.list] raw body:', raw);

    if (!res.ok) {
      throw new Error(`Error ${res.status} ${raw}`);
    }

    const parsed = JSON.parse(raw);
    const items = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.data) ? parsed.data : [];

    console.log('📦 [agenciasService.list] items (len):', items.length, items);
    return items as AgenciaBackData[];
  },

  /** 3) Obtener agencia por ID (GET) */
  async getById(id: number | string): Promise<AgenciaBackData> {
    const endpoint = `https://travelconnect.com.ar/agencia/${id}`;

    const res = await fetch(endpoint, { method: 'GET' });
    console.log('🔎 [agenciasService.getById] status:', res.status);

    const raw = await res.text();
    console.log('🧾 [agenciasService.getById] raw body:', raw);

    if (!res.ok) {
      throw new Error(`Error ${res.status} ${raw}`);
    }

    const parsed = JSON.parse(raw);
    const item = parsed?.data ?? parsed;
    console.log('📦 [agenciasService.getById] item:', item);

    return item as AgenciaBackData;
  },

  /** 1) Crear nueva agencia (POST) */
  async create(
    payload: AgenciaPayloadBackend
  ): Promise<{ success: boolean; data?: AgenciaBackData; id?: number; error?: string }> {
    const endpoint = 'https://travelconnect.com.ar/agencia/new';

    console.log('🧾 [agenciasService.create] Payload (sin files):', {
      ...payload,
      logo: payload.logo instanceof File ? '[File]' : payload.logo,
      header_imagen: payload.header_imagen instanceof File ? '[File]' : payload.header_imagen,
      header_video: payload.header_video instanceof File ? '[File]' : payload.header_video,
      terminos_y_condiciones: payload.terminos_y_condiciones instanceof File ? '[File]' : payload.terminos_y_condiciones,
      publicidad_imagen_1: payload.publicidad_imagen_1 instanceof File ? '[File]' : payload.publicidad_imagen_1,
      publicidad_imagen_2: payload.publicidad_imagen_2 instanceof File ? '[File]' : payload.publicidad_imagen_2,
      publicidad_imagen_3: payload.publicidad_imagen_3 instanceof File ? '[File]' : payload.publicidad_imagen_3,
    });

    const formData = buildAgenciaFormData(payload);

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      const raw = await res.text();
      console.log('📤 [agenciasService.create] Response:', res.status, raw);

      if (!res.ok) {
        throw new Error(`Error ${res.status} ${raw}`);
      }

      const data = JSON.parse(raw);
      console.log('[agenciasService.create] Éxito', data);

      return {
        success: true,
        data: data.data,
        id: data.data?.idAgencia ? parseInt(data.data.idAgencia) : undefined,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error('[agenciasService.create] Error:', errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  /** 2) Actualizar agencia existente (PUT) */
  async update(
    id: string | number,
    payload: AgenciaPayloadBackend
  ): Promise<{ success: boolean; data?: AgenciaBackData; error?: string }> {
    const endpoint = `https://travelconnect.com.ar/update_agencia/${id}`;

    console.log('✏️ [agenciasService.update] ID:', id, 'Payload (sin files):', {
      ...payload,
      logo: payload.logo instanceof File ? '[File]' : payload.logo,
      header_imagen: payload.header_imagen instanceof File ? '[File]' : payload.header_imagen,
      header_video: payload.header_video instanceof File ? '[File]' : payload.header_video,
      terminos_y_condiciones: payload.terminos_y_condiciones instanceof File ? '[File]' : payload.terminos_y_condiciones,
      publicidad_imagen_1: payload.publicidad_imagen_1 instanceof File ? '[File]' : payload.publicidad_imagen_1,
      publicidad_imagen_2: payload.publicidad_imagen_2 instanceof File ? '[File]' : payload.publicidad_imagen_2,
      publicidad_imagen_3: payload.publicidad_imagen_3 instanceof File ? '[File]' : payload.publicidad_imagen_3,
    });

    const formData = buildAgenciaFormData(payload);

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      const raw = await res.text();
      console.log('📤 [agenciasService.update] Response:', res.status, raw);

      if (!res.ok) {
        throw new Error(`Error ${res.status} ${raw}`);
      }

      const data = JSON.parse(raw);
      console.log('[agenciasService.update] Éxito', data);

      return {
        success: true,
        data: data.data,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error('[agenciasService.update] Error:', errorMessage);
      return { success: false, error: errorMessage };
    }
  },
};
