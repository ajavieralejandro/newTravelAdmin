// src/components/ConfigAgencia/credencialesAtlasService.ts
import { authFetch } from '@/lib/auth/authFetch';

const BASE_URL = 'https://travelconnect.com.ar';

export type CredencialesAtlasPayload = {
  atlas_usuario: string;
  atlas_clave: string;     // write-only
  atlas_empresa: string;
  atlas_sucursal: string;
};

export type CredencialesAtlasResponse = {
  message: string; // "Credenciales de Atlas actualizadas correctamente"
  agencia: {
    id: number;
    atlas_usuario: string;
    atlas_empresa: string;
    atlas_sucursal: string;
  };
};

async function safeJson<T>(res: Response): Promise<T | null> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

export async function guardarCredencialesAtlas(
  agenciaId: number,
  payload: CredencialesAtlasPayload
): Promise<CredencialesAtlasResponse> {
  const res = await authFetch(`${BASE_URL}/credenciales_atlas/${agenciaId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await safeJson<CredencialesAtlasResponse>(res);

  if (!res.ok) {
    const msg = (data as any)?.message || `Error al guardar credenciales de Atlas (HTTP ${res.status})`;
    throw new Error(msg);
  }
  if (!data) {
    throw new Error('Respuesta vacía del servidor al guardar credenciales de Atlas');
  }
  return data;
}
