import { AgenciaPayload } from '@/types/AgenciaPayload';

/**
 * Convierte AgenciaPayload -> FormData, compatible con Laravel:
 * - Archivos: SOLO si son File (URLs o null se omiten).
 * - Booleanos: "1"/"0".
 * - Números: toString().
 * - Password: se omite si viene string vacío (para no pisar).
 */
export function buildAgenciaFormData(
  payload: AgenciaPayload,
  opts?: { includeEmptyPassword?: boolean }
): FormData {
  const formData = new FormData();
  const includeEmptyPassword = opts?.includeEmptyPassword ?? false;

  // Claves que son archivos en el backend
  const fileKeys = new Set<keyof AgenciaPayload>([
    'logo',
    'header_imagen_background',
    'header_video_background',
    'terminos_y_condiciones',
    'publicidad_imagen_1',
    'publicidad_imagen_2',
    'publicidad_imagen_3',
  ]);

  // Helper para booleans "1"/"0"
  const to10 = (b: boolean) => (b ? '1' : '0');

  // Iteramos cada campo del payload
  (Object.keys(payload) as (keyof AgenciaPayload)[]).forEach((key) => {
    const value = payload[key];

    // Saltar null/undefined
    if (value === null || value === undefined) return;

    // Password: omitir si viene vacío (a menos que se fuerce)
    if (key === 'password' && typeof value === 'string' && value.trim() === '' && !includeEmptyPassword) {
      return;
    }

    // Archivos: SOLO si es File
    if (fileKeys.has(key)) {
      if (value instanceof File) {
        formData.append(key, value);
      }
      // si es string (URL) o null: no enviar
      return;
    }

    // Booleanos -> "1"/"0"
    if (typeof value === 'boolean') {
      formData.append(key, to10(value));
      return;
    }

    // Números -> string
    if (typeof value === 'number') {
      formData.append(key, String(value));
      return;
    }

    // Strings -> tal cual
    if (typeof value === 'string') {
      formData.append(key, value);
      return;
    }

    // Cualquier otro tipo (no debería haber)
    // Evitamos enviar objetos por accidente
  });

  return formData;
}
