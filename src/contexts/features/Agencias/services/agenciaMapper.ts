// services/agenciaMapper.ts
'use client';

import type { AgenciaBackData } from '@/types/AgenciaBackData';
import type { AgenciaPayload } from '@/types/AgenciaPayload';

// 🎨 Defaults centralizados
const DEFAULT_COLOR = '#ffffff';
const DEFAULT_TEXT = '';

// Helpers de normalización
const isNil = (v: unknown): v is null | undefined => v === null || v === undefined;
const normalizeColor = (v: string | null | undefined): string =>
  isNil(v) || v === '' ? DEFAULT_COLOR : v;
const normalizeText = (v: string | null | undefined): string =>
  isNil(v) ? DEFAULT_TEXT : v;

// 🔖 Tipo para la UI (formularios)
// Igual a AgenciaPayload pero con password opcional, y manteniendo los mismos nombres que espera la UI.
// *Importante*: mantenemos `header_imagen_background` y `header_video_background` para la UI.
export type AgenciaFormValues = Omit<AgenciaPayload, 'password'> & {
  password?: string;
  // Podrías agregar metadatos si la UI los necesita (idAgencia, url, etc.)
};

// 📤 Tipo para enviar al backend (renombramos las keys de header_*_background)
// Hacemos `password` OPCIONAL para no forzar su envío en edición.
export type AgenciaPayloadBackend =
  Omit<AgenciaPayload, 'header_imagen_background' | 'header_video_background' | 'password'> & {
    header_imagen?: File | string | null;
    header_video?: File | string | null;
    password?: string;
  };

/**
 * Back (crudo) -> Form (UI listo)
 * - Normaliza nulls a defaults
 * - Renombra header_imagen -> header_imagen_background (y video idem) para estabilizar la UI
 */
export function mapBackToForm(back: AgenciaBackData): AgenciaFormValues {
  console.info('[agenciaMapper] mapBackToForm(): inicio', back);

  const form: AgenciaFormValues = {
    // --- Identidad / auth ---
    nombre: normalizeText(back.nombre),
    dominio: normalizeText(back.dominio),
    estado: !!back.estado,
    // En edición no forzamos password
    password: back.password ?? undefined,

    // --- Archivos (string URL | null) → la UI puede mantener string si no cambia
    logo: back.logo ?? null,
    header_imagen_background: back.header_imagen ?? null,
    header_video_background: back.header_video ?? null,
    terminos_y_condiciones: back.terminos_y_condiciones ?? null,
    publicidad_imagen_1: back.publicidad_imagen_1 ?? null,
    publicidad_imagen_2: back.publicidad_imagen_2 ?? null,
    publicidad_imagen_3: back.publicidad_imagen_3 ?? null,

    // --- Estilos generales ---
    tipografia_agencia: normalizeText(back.tipografia_agencia),
    color_tipografia_agencia: normalizeColor(back.color_tipografia_agencia),
    color_fondo_app: normalizeColor(back.color_fondo_app),
    color_principal: normalizeColor(back.color_principal),
    color_secundario: normalizeColor(back.color_secundario),
    color_terciario: normalizeColor(back.color_terciario),

    // --- Header ---
    header_imagen_background_opacidad: Number(back.header_imagen_background_opacidad ?? 1),
    header_video_background_opacidad: Number(back.header_video_background_opacidad ?? 1),

    // --- Buscador ---
    buscador_tipografia: normalizeText(back.buscador_tipografia),
    buscador_tipografia_color: normalizeColor(back.buscador_tipografia_color),
    buscador_tipografia_color_label: normalizeColor(back.buscador_tipografia_color_label),
    buscador_inputColor: normalizeColor(back.buscador_inputColor),
    buscador_inputFondoColor: normalizeColor(back.buscador_inputFondoColor),
    buscador_color_primario: normalizeColor(back.buscador_color_primario),
    buscador_color_secundario: normalizeColor(back.buscador_color_secundario),
    buscador_color_terciario: normalizeColor(back.buscador_color_terciario),

    // --- Publicidad Cliente ---
    publicidad_existe: !!back.publicidad_existe,
    publicidad_titulo: normalizeText(back.publicidad_titulo),
    publicidad_tipografia_color: normalizeColor(back.publicidad_tipografia_color),
    publicidad_color_primario: normalizeColor(back.publicidad_color_primario),
    publicidad_color_secundario: normalizeColor(back.publicidad_color_secundario),
    publicidad_color_terciario: normalizeColor(back.publicidad_color_terciario),

    // --- Tarjetas ---
    tarjetas_titulo: normalizeText(back.tarjetas_titulo),
    tarjetas_tipografia: normalizeText(back.tarjetas_tipografia),
    tarjetas_tipografia_color: normalizeColor(back.tarjetas_tipografia_color),
    tarjetas_tipografia_color_titulo: normalizeColor(back.tarjetas_tipografia_color_titulo),
    tarjetas_tipografia_color_contenido: normalizeColor(back.tarjetas_tipografia_color_contenido),
    tarjetas_color_primario: normalizeColor(back.tarjetas_color_primario),
    tarjetas_color_secundario: normalizeColor(back.tarjetas_color_secundario),
    tarjetas_color_terciario: normalizeColor(back.tarjetas_color_terciario),

    // --- Banner Registro ---
    banner_registro_titulo: normalizeText(back.banner_registro_titulo),
    banner_registro_tipografia_color: normalizeColor(back.banner_registro_tipografia_color),
    banner_registro_color_primario: normalizeColor(back.banner_registro_color_primario),
    banner_registro_color_secundario: normalizeColor(back.banner_registro_color_secundario),
    banner_registro_color_terciario: normalizeColor(back.banner_registro_color_terciario),

    // --- Información institucional ---
    quienes_somos_es: normalizeText(back.quienes_somos_es),
    quienes_somos_en: normalizeText(back.quienes_somos_en),
    quienes_somos_pt: normalizeText(back.quienes_somos_pt),

    // --- Footer ---
    footer_texto: normalizeText(back.footer_texto),
    footer_tipografia: normalizeText(back.footer_tipografia),
    footer_tipografia_color: normalizeColor(back.footer_tipografia_color),
    footer_color_primario: normalizeColor(back.footer_color_primario),
    footer_color_secundario: normalizeColor(back.footer_color_secundario),
    footer_color_terciario: normalizeColor(back.footer_color_terciario),

    // --- Redes ---
    footer_facebook: normalizeText(back.footer_facebook),
    footer_instagram: normalizeText(back.footer_instagram),
    footer_twitter: normalizeText(back.footer_twitter),
    footer_whatsapp: normalizeText(back.footer_whatsapp),

    // --- Contacto / ubicación ---
    footer_email: normalizeText(back.footer_email),
    footer_telefono: normalizeText(back.footer_telefono),
    footer_direccion: normalizeText(back.footer_direccion),
    footer_ciudad: normalizeText(back.footer_ciudad),
    footer_pais: normalizeText(back.footer_pais),
  };

  console.info('[agenciaMapper] mapBackToForm(): salida', form);
  return form;
}

/**
 * Form (UI) -> Payload listo para enviar al backend
 * - Aplica mapeo mínimo: header_imagen_background → header_imagen; header_video_background → header_video
 * - Mantiene Files si el usuario cambió un archivo; si es string (URL), se mantiene string
 *   (la capa de FormData puede omitir null/strings según política del servicio)
 */
export function mapFormToPayload(form: AgenciaFormValues): AgenciaPayloadBackend {
  console.info('[agenciaMapper] mapFormToPayload(): inicio', form);

  const payload: AgenciaPayloadBackend = {
    // --- Identidad / auth ---
    nombre: normalizeText(form.nombre),
    dominio: normalizeText(form.dominio),
    estado: !!form.estado,
    ...(form.password ? { password: form.password } : {}),

    // --- Archivos (renombrados para backend) ---
    logo: isNil(form.logo) ? null : form.logo,
    header_imagen: isNil(form.header_imagen_background) ? null : form.header_imagen_background,
    header_video: isNil(form.header_video_background) ? null : form.header_video_background,
    terminos_y_condiciones: isNil(form.terminos_y_condiciones) ? null : form.terminos_y_condiciones,
    publicidad_imagen_1: isNil(form.publicidad_imagen_1) ? null : form.publicidad_imagen_1,
    publicidad_imagen_2: isNil(form.publicidad_imagen_2) ? null : form.publicidad_imagen_2,
    publicidad_imagen_3: isNil(form.publicidad_imagen_3) ? null : form.publicidad_imagen_3,

    // --- Estilos generales ---
    tipografia_agencia: normalizeText(form.tipografia_agencia),
    color_tipografia_agencia: normalizeColor(form.color_tipografia_agencia),
    color_fondo_app: normalizeColor(form.color_fondo_app),
    color_principal: normalizeColor(form.color_principal),
    color_secundario: normalizeColor(form.color_secundario),
    color_terciario: normalizeColor(form.color_terciario),

    // --- Header ---
    header_imagen_background_opacidad: Number(form.header_imagen_background_opacidad ?? 1),
    header_video_background_opacidad: Number(form.header_video_background_opacidad ?? 1),

    // --- Buscador ---
    buscador_tipografia: normalizeText(form.buscador_tipografia),
    buscador_tipografia_color: normalizeColor(form.buscador_tipografia_color),
    buscador_tipografia_color_label: normalizeColor(form.buscador_tipografia_color_label),
    buscador_inputColor: normalizeColor(form.buscador_inputColor),
    buscador_inputFondoColor: normalizeColor(form.buscador_inputFondoColor),
    buscador_color_primario: normalizeColor(form.buscador_color_primario),
    buscador_color_secundario: normalizeColor(form.buscador_color_secundario),
    buscador_color_terciario: normalizeColor(form.buscador_color_terciario),

    // --- Publicidad Cliente ---
    publicidad_existe: !!form.publicidad_existe,
    publicidad_titulo: normalizeText(form.publicidad_titulo),
    publicidad_tipografia_color: normalizeColor(form.publicidad_tipografia_color),
    publicidad_color_primario: normalizeColor(form.publicidad_color_primario),
    publicidad_color_secundario: normalizeColor(form.publicidad_color_secundario),
    publicidad_color_terciario: normalizeColor(form.publicidad_color_terciario),

    // --- Tarjetas ---
    tarjetas_titulo: normalizeText(form.tarjetas_titulo),
    tarjetas_tipografia: normalizeText(form.tarjetas_tipografia),
    tarjetas_tipografia_color: normalizeColor(form.tarjetas_tipografia_color),
    tarjetas_tipografia_color_titulo: normalizeColor(form.tarjetas_tipografia_color_titulo),
    tarjetas_tipografia_color_contenido: normalizeColor(form.tarjetas_tipografia_color_contenido),
    tarjetas_color_primario: normalizeColor(form.tarjetas_color_primario),
    tarjetas_color_secundario: normalizeColor(form.tarjetas_color_secundario),
    tarjetas_color_terciario: normalizeColor(form.tarjetas_color_terciario),

    // --- Banner Registro ---
    banner_registro_titulo: normalizeText(form.banner_registro_titulo),
    banner_registro_tipografia_color: normalizeColor(form.banner_registro_tipografia_color),
    banner_registro_color_primario: normalizeColor(form.banner_registro_color_primario),
    banner_registro_color_secundario: normalizeColor(form.banner_registro_color_secundario),
    banner_registro_color_terciario: normalizeColor(form.banner_registro_color_terciario),

    // --- Información institucional ---
    quienes_somos_es: normalizeText(form.quienes_somos_es),
    quienes_somos_en: normalizeText(form.quienes_somos_en),
    quienes_somos_pt: normalizeText(form.quienes_somos_pt),

    // --- Footer ---
    footer_texto: normalizeText(form.footer_texto),
    footer_tipografia: normalizeText(form.footer_tipografia),
    footer_tipografia_color: normalizeColor(form.footer_tipografia_color),
    footer_color_primario: normalizeColor(form.footer_color_primario),
    footer_color_secundario: normalizeColor(form.footer_color_secundario),
    footer_color_terciario: normalizeColor(form.footer_color_terciario),

    // --- Redes / contacto / ubicación ---
    footer_facebook: normalizeText(form.footer_facebook),
    footer_instagram: normalizeText(form.footer_instagram),
    footer_twitter: normalizeText(form.footer_twitter),
    footer_whatsapp: normalizeText(form.footer_whatsapp),
    footer_email: normalizeText(form.footer_email),
    footer_telefono: normalizeText(form.footer_telefono),
    footer_direccion: normalizeText(form.footer_direccion),
    footer_ciudad: normalizeText(form.footer_ciudad),
    footer_pais: normalizeText(form.footer_pais),
  };

  console.info('[agenciaMapper] mapFormToPayload(): salida', payload);
  return payload;
}
