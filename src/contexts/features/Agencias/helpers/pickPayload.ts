// contexts/features/Agencias/helpers/pickPayload.ts
'use client';

import type { AgenciaPayload } from '@/types/AgenciaPayload';

/**
 * Devuelve un objeto con SOLO las claves válidas del AgenciaPayload.
 * No realiza conversiones: solo filtra y copia si value !== undefined.
 */
export function pickPayload<T extends Record<string, any>>(
  values: T,
  keys: readonly (keyof AgenciaPayload)[]
): Partial<AgenciaPayload> {
  const acc: Partial<AgenciaPayload> = {};
  for (const k of keys) {
    const v = values[k as keyof T];
    if (v !== undefined) {
      (acc as Record<string, unknown>)[k as string] = v;
    }
  }
  return acc;
}
