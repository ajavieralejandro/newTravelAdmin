import Step1Basic from './Step1Basic';
import StepDatosGenerales from './StepDatosGenerales';
import StepHeader from './StepHeader';
import StepBuscador from './StepBuscador';
import StepPublicidadCliente from './StepPublicidadCliente';
import StepTarjetas from './StepTarjetas';
import StepBannerRegistro from './StepBannerRegistro';
import StepFooter from './StepFooter';

export const stepsConfig = [
  {
    title: 'Datos Principales',
    description: 'Información básica de la agencia',
    component: Step1Basic,
    fields: [
      'estado',
      'nombre',
      'dominio',
      'password',
      'logo',
      'terminos_y_condiciones',
      'quienes_somos_es',
      'quienes_somos_en',
      'quienes_somos_pt',
    ],
  },
  {
    title: 'Datos Generales',
    description: 'Estilos tipográficos y colores base',
    component: StepDatosGenerales,
    fields: [
      'tipografia_agencia',
      'color_tipografia_agencia',
      'color_fondo_app',
      'color_principal',
      'color_secundario',
      'color_terciario',
    ],
  },
  {
    title: 'Header',
    description: 'Personalización del encabezado',
    component: StepHeader,
    fields: [
      'header_imagen_background',
      'header_imagen_background_opacidad',
      'header_video_background',
      'header_video_background_opacidad',
    ],
  },
  {
    title: 'Buscador',
    description: 'Estilo del buscador de paquetes',
    component: StepBuscador,
    fields: [
      'buscador_tipografia',
      'buscador_tipografia_color',
      'buscador_tipografia_color_label',
      'buscador_color_primario',
      'buscador_color_secundario',
      'buscador_color_terciario',
      'buscador_inputColor',
      'buscador_inputFondoColor',
    ],
  },
  {
    title: 'Publicidad Cliente',
    description: 'Configuración visual del área publicitaria',
    component: StepPublicidadCliente,
    fields: [
      'publicidad_existe',
      'publicidad_titulo',
      'publicidad_tipografia_color',
      'publicidad_color_primario',
      'publicidad_color_secundario',
      'publicidad_color_terciario',
      'publicidad_imagen_1',
      'publicidad_imagen_2',
      'publicidad_imagen_3',
    ],
  },
  {
    title: 'Tarjetas',
    description: 'Diseño visual de las tarjetas de contenido',
    component: StepTarjetas,
    fields: [
      'tarjetas_titulo',
      'tarjetas_tipografia',
      'tarjetas_tipografia_color',
      'tarjetas_tipografia_color_titulo',
      'tarjetas_tipografia_color_contenido',
      'tarjetas_color_primario',
      'tarjetas_color_secundario',
      'tarjetas_color_terciario',
    ],
  },
  {
    title: 'Banner de Registro',
    description: 'Personalización del banner de registro',
    component: StepBannerRegistro,
    fields: [
      'banner_registro_titulo',
      'banner_registro_tipografia_color',
      'banner_registro_color_primario',
      'banner_registro_color_secundario',
      'banner_registro_color_terciario',
    ],
  },
  {
    title: 'Footer',
    description: 'Pie de página, redes y contacto',
    component: StepFooter,
    fields: [
      // Visual
      'footer_texto',
      'footer_tipografia',
      'footer_tipografia_color',
      'footer_color_primario',
      'footer_color_secundario',
      'footer_color_terciario',

      // Redes sociales
      'footer_facebook',
      'footer_twitter',
      'footer_instagram',
      'footer_whatsapp',

      // Contacto
      'footer_email',
      'footer_telefono',

      // Ubicación
      'footer_direccion',
      'footer_ciudad',
      'footer_pais',
    ],
  },
] as const;

export type AgenciaFormFields = typeof stepsConfig[number]['fields'][number];
