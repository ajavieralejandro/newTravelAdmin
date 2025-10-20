import { AgenciaPayload } from '@/types/AgenciaPayload';
import { buildAgenciaFormData } from '@/components/form/buildAgenciaFormData';
import type { AgenciasContextState } from '../../../../types/types';

export const createAgencia = async (
  payload: AgenciaPayload,
  contextState: AgenciasContextState,
  stateMethods: { setError: (error: string | null) => void }
): Promise<{
  success: boolean;
  token?: string;
  user?: unknown;
  agencia?: unknown;
  error?: string;
  statusCode?: number;
}> => {
  try {
    console.group('[createAgencia] Inicio');

    const formData = buildAgenciaFormData(payload);

    // 🔍 Log: FormData generado
    console.log('[createAgencia] FormData generado:');
    Array.from(formData.entries()).forEach(([clave, valor]) => {
      const tipo = valor instanceof File ? 'File' : typeof valor;
      console.log(`→ ${clave}:`, valor, `(tipo: ${tipo})`);
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch('https://travelconnect.com.ar/agencia/new', {
      method: 'POST',
      body: formData,
      signal: controller.signal,
      credentials: 'include',
    });

    clearTimeout(timeoutId);

    const data = await response.json().catch(() => ({}));

    if (!response.ok || data.errors || data.error || data.message) {
      const msg =
        data.errors?.join(', ') ||
        data.error ||
        data.message ||
        `Error HTTP ${response.status}`;
      throw new Error(msg);
    }

    if (!data.user || !data.token) {
      throw new Error('Faltan datos esperados del usuario o token');
    }

    console.log('[createAgencia] Éxito', data);

    return {
      success: true,
      user: data.user,
      token: data.token,
      agencia: data.agencia,
      statusCode: response.status,
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error de red';
    console.error('[createAgencia] Error capturado:', errorMessage);
    stateMethods.setError(errorMessage);

    return {
      success: false,
      error: errorMessage,
      statusCode: (error as any)?.status || 500,
    };
  } finally {
    console.groupEnd();
  }
};
