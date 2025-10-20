// services/agenciaStore.ts
'use client';

import type { AgenciaBackData } from '@/types/AgenciaBackData';

export const AGENCIA_KEY = 'agencia-data';

const hasWindow = (): boolean =>
  typeof window !== 'undefined' && !!window.localStorage;

/**
 * Crea un objeto AgenciaBackData vacío con la forma esperada por el backend.
 * Usamos '' en strings requeridos, null en campos que son string|null,
 * números con defaults razonables y booleans expresivos.
 */
export function createEmptyAgenciaBackData(): AgenciaBackData {
  return {
    // --- Identificación y credenciales ---
    idAgencia: '',
    nombre: '',
    dominio: '',
    url: '',
    estado: true,
    // password es opcional
    // password: '',

    // --- Colores y estilo general ---
    tipografia_agencia: '',
    color_tipografia_agencia: '#000000',
    color_fondo_app: '#ffffff',
    color_principal: null,
    color_secundario: '#000000',
    color_terciario: '#000000',

    // --- Header ---
    header_imagen_background: null,
    header_imagen_background_opacidad: 1,
    header_video_background: null,
    header_video_background_opacidad: 1,

    // --- Buscador ---
    buscador_tipografia: '',
    buscador_tipografia_color: '#000000',
    buscador_tipografia_color_label: '#000000',
    buscador_inputColor: null,
    buscador_inputFondoColor: null,
    buscador_color_primario: '#000000',
    buscador_color_secundario: '#000000',
    buscador_color_terciario: '#000000',

    // --- Publicidad del cliente ---
    publicidad_existe: false,
    publicidad_titulo: null,
    publicidad_tipografia_color: null,
    publicidad_color_primario: null,
    publicidad_color_secundario: null,
    publicidad_color_terciario: null,

    // --- Tarjetas ---
    tarjetas_titulo: '',
    tarjetas_tipografia: '',
    tarjetas_tipografia_color: '#000000',
    tarjetas_tipografia_color_titulo: '#000000',
    tarjetas_tipografia_color_contenido: '#000000',
    tarjetas_color_primario: '#000000',
    tarjetas_color_secundario: '#000000',
    tarjetas_color_terciario: '#000000',

    // --- Banner de registro ---
    banner_registro_titulo: '',
    banner_registro_tipografia_color: '#000000',
    banner_registro_color_primario: '#000000',
    banner_registro_color_secundario: '#000000',
    banner_registro_color_terciario: '#000000',

    // --- Sección "Quiénes somos" ---
    quienes_somos_es: '',
    quienes_somos_en: '',
    quienes_somos_pt: '',

    // --- Footer / Pie de página ---
    footer_texto: '',
    footer_tipografia: '',
    footer_tipografia_color: '#000000',
    footer_color_primario: '#000000',
    footer_color_secundario: '#000000',
    footer_color_terciario: '#000000',

    // --- Contacto y redes ---
    footer_facebook: '',
    footer_instagram: '',
    footer_twitter: '',
    footer_whatsapp: '',
    footer_email: '',
    footer_telefono: '',
    footer_direccion: '',
    footer_ciudad: '',
    footer_pais: '',

    // --- Términos y condiciones ---
    terminos_y_condiciones: null,

    // --- Multimedia (URLs) ---
    logo: null,
    header_video: null,
    header_imagen: null,
    publicidad_imagen_1: null,
    publicidad_imagen_2: null,
    publicidad_imagen_3: null,
  };
}

export function readAgenciaRawFromLocal(): AgenciaBackData | null {
  if (!hasWindow()) {
    console.warn('[agenciaStore] readAgenciaRawFromLocal(): no window/localStorage (SSR)');
    return null;
  }
  try {
    const raw = window.localStorage.getItem(AGENCIA_KEY);
    if (!raw) {
      console.info('[agenciaStore] readAgenciaRawFromLocal(): no data');
      return null;
    }
    const parsed = JSON.parse(raw) as AgenciaBackData;
    console.info('[agenciaStore] readAgenciaRawFromLocal(): ok', parsed);
    return parsed;
  } catch (err) {
    console.error('[agenciaStore] readAgenciaRawFromLocal(): error parsing', err);
    return null;
  }
}

/**
 * Intenta leer; si no existe, crea un objeto vacío y lo persiste.
 */
export function readOrCreateAgenciaRawFromLocal(): AgenciaBackData {
  const existing = readAgenciaRawFromLocal();
  if (existing) return existing;
  const empty = createEmptyAgenciaBackData();
  writeAgenciaRawToLocal(empty);
  console.info('[agenciaStore] readOrCreateAgenciaRawFromLocal(): initialized empty back data');
  return empty;
}

export function writeAgenciaRawToLocal(data: AgenciaBackData): void {
  if (!hasWindow()) {
    console.warn('[agenciaStore] writeAgenciaRawToLocal(): no window/localStorage (SSR)');
    return;
  }
  try {
    window.localStorage.setItem(AGENCIA_KEY, JSON.stringify(data));
    console.info('[agenciaStore] writeAgenciaRawToLocal(): saved');
  } catch (err) {
    console.error('[agenciaStore] writeAgenciaRawToLocal(): error saving', err);
  }
}

export function patchAgenciaRawInLocal(
  patch: Partial<AgenciaBackData>
): AgenciaBackData | null {
  if (!hasWindow()) {
    console.warn('[agenciaStore] patchAgenciaRawInLocal(): no window/localStorage (SSR)');
    return null;
  }
  try {
    const current = readAgenciaRawFromLocal();
    const next = { ...(current ?? ({} as AgenciaBackData)), ...patch } as AgenciaBackData;
    window.localStorage.setItem(AGENCIA_KEY, JSON.stringify(next));
    console.info('[agenciaStore] patchAgenciaRawInLocal(): patched', { patch, next });
    return next;
  } catch (err) {
    console.error('[agenciaStore] patchAgenciaRawInLocal(): error patching', err);
    return null;
  }
}

export function clearAgenciaRawFromLocal(): void {
  if (!hasWindow()) {
    console.warn('[agenciaStore] clearAgenciaRawFromLocal(): no window/localStorage (SSR)');
    return;
  }
  try {
    window.localStorage.removeItem(AGENCIA_KEY);
    console.info('[agenciaStore] clearAgenciaRawFromLocal(): cleared');
  } catch (err) {
    console.error('[agenciaStore] clearAgenciaRawFromLocal(): error clearing', err);
  }
}
