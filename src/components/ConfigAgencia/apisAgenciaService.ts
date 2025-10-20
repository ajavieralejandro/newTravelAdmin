// components/ConfigAgencia/apisAgenciaService.ts
import { authFetch } from '@/lib/auth/authFetch';

const BASE_URL = 'https://travelconnect.com.ar';

export type ApiTercero = {
  id: number;
  nombre: string;
  descripcion: string;
};

type AssocPayload = { api_ids: number[] };
type ApiListResponse = ApiTercero[];
type ApiAssocResponse = { message?: string } | Record<string, unknown>;

async function safeJson<T>(res: Response): Promise<T | null> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

/** GET /apis — lista completa de APIs disponibles */
export async function fetchTodasLasApis(): Promise<ApiListResponse> {
  console.log('📡 [fetchTodasLasApis] GET /apis');
  const res = await authFetch(`${BASE_URL}/apis`);
  console.log('📥 [fetchTodasLasApis] Status:', res.status);
  if (!res.ok) throw new Error('Error al obtener lista completa de APIs');
  const data = (await safeJson<ApiListResponse>(res)) ?? [];
  console.log('✅ [fetchTodasLasApis] APIs recibidas:', data);
  return data;
}

/** GET /api_agencias/{agenciaId}/apis — APIs activas de una agencia */
export async function fetchApisDeAgencia(agenciaId: number): Promise<ApiListResponse> {
  console.log(`📡 [fetchApisDeAgencia] GET /api_agencias/${agenciaId}/apis`);
  const res = await authFetch(`${BASE_URL}/api_agencias/${agenciaId}/apis`);
  console.log(`[fetchApisDeAgencia] Status ${res.status}`);
  if (!res.ok) throw new Error(`Error al obtener APIs de agencia ${agenciaId}`);
  const data = (await safeJson<ApiListResponse>(res)) ?? [];
  console.log(`✅ [fetchApisDeAgencia] APIs activas de agencia ${agenciaId}:`, data);
  return data;
}

/** POST /api_agencias/{agenciaId}/apis — asociar 1..n APIs a una agencia */
export async function asociarApisAAgencia(
  agenciaId: number,
  apiIds: number[]
): Promise<ApiAssocResponse | null> {
  console.log(`📡 [asociarApisAAgencia] POST /api_agencias/${agenciaId}/apis -> [${apiIds.join(', ')}]`);
  const payload: AssocPayload = { api_ids: apiIds };
  const res = await authFetch(`${BASE_URL}/api_agencias/${agenciaId}/apis`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  console.log(`[asociarApisAAgencia] Status ${res.status}`);
  if (!res.ok) throw new Error('Error al asociar APIs');
  const data = await safeJson<ApiAssocResponse>(res);
  console.log('✅ [asociarApisAAgencia] Resultado:', data);
  return data;
}

/** DELETE /api_agencias/{agenciaId}/apis/{apiId} — desasociar una API */
export async function desasociarApiDeAgencia(
  agenciaId: number,
  apiId: number
): Promise<ApiAssocResponse | null> {
  console.log(`📡 [desasociarApiDeAgencia] DELETE /api_agencias/${agenciaId}/apis/${apiId}`);
  const res = await authFetch(`${BASE_URL}/api_agencias/${agenciaId}/apis/${apiId}`, {
    method: 'DELETE',
  });
  console.log(`[desasociarApiDeAgencia] Status ${res.status}`);
  if (!res.ok) throw new Error(`Error al desasociar API ${apiId} de agencia ${agenciaId}`);
  // Algunos backends devuelven 204 No Content
  const data = await safeJson<ApiAssocResponse>(res);
  console.log('✅ [desasociarApiDeAgencia] Resultado:', data ?? '(sin cuerpo)');
  return data;
}
