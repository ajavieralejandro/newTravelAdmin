export interface AgenciaPayload {
  // --- Identificación y autenticación ---
  nombre: string;
  dominio: string;
  estado: boolean;
  password?: string;

  // --- Archivos (File nuevo | string existente | null) ---
  logo?: File | string | null;
  header_imagen_background?: File | string | null;
  header_video_background?: File | string | null;
  terminos_y_condiciones?: File | string | null;
  publicidad_imagen_1?: File | string | null;
  publicidad_imagen_2?: File | string | null;
  publicidad_imagen_3?: File | string | null;

  // --- Estilos generales ---
  tipografia_agencia: string;
  color_tipografia_agencia: string;
  color_fondo_app: string;
  color_principal: string;
  color_secundario: string;
  color_terciario: string;

  // --- Header ---
  header_imagen_background_opacidad: number;
  header_video_background_opacidad: number;

  // --- Buscador ---
  buscador_tipografia: string;
  buscador_tipografia_color: string;
  buscador_tipografia_color_label: string;
  buscador_inputColor: string;
  buscador_inputFondoColor: string;
  buscador_color_primario: string;
  buscador_color_secundario: string;
  buscador_color_terciario: string;

  // --- Publicidad Cliente ---
  publicidad_existe: boolean;
  publicidad_titulo: string;
  publicidad_tipografia_color: string;
  publicidad_color_primario: string;
  publicidad_color_secundario: string;
  publicidad_color_terciario: string;

  // --- Tarjetas ---
  tarjetas_titulo: string;
  tarjetas_tipografia: string;
  tarjetas_tipografia_color: string;
  tarjetas_tipografia_color_titulo: string;
  tarjetas_tipografia_color_contenido: string;
  tarjetas_color_primario: string;
  tarjetas_color_secundario: string;
  tarjetas_color_terciario: string;

  // --- Banner Registro ---
  banner_registro_titulo: string;
  banner_registro_tipografia_color: string;
  banner_registro_color_primario: string;
  banner_registro_color_secundario: string;
  banner_registro_color_terciario: string;

  // --- Información institucional ---
  quienes_somos_es: string;
  quienes_somos_en: string;
  quienes_somos_pt: string;

  // --- Footer (visual y estilos) ---
  footer_texto: string;
  footer_tipografia: string;
  footer_tipografia_color: string;
  footer_color_primario: string;
  footer_color_secundario: string;
  footer_color_terciario: string;

  // --- Redes sociales ---
  footer_facebook: string;
  footer_instagram: string;
  footer_twitter: string;
  footer_whatsapp: string;

  // --- Contacto ---
  footer_email: string;
  footer_telefono: string;

  // --- Ubicación ---
  footer_direccion: string;
  footer_ciudad: string;
  footer_pais: string;
}
