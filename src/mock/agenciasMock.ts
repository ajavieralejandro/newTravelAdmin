import { AgenciaBackData } from '@/types/AgenciaBackData';

export const agenciaMock: AgenciaBackData[] = [
  {
    // Identificación
    idAgencia: '9999999',
    nombre: 'Viajes Global Sur',
    dominio: 'global-sur.com',
    url: 'https://www.global-sur.com',
    estado: true,
    password: undefined,

    // Estilos generales
    tipografia_agencia: 'Poppins',
    color_tipografia_agencia: '#222831',
    color_fondo_app: '#F9F9F9',
    color_principal: '#FF6B6B',
    color_secundario: '#FFD93D',
    color_terciario: '#6BCB77',

    // Header
    header_imagen_background: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
    header_imagen_background_opacidad: 0.6,
    header_video_background: 'https://player.vimeo.com/external/469184533.hd.mp4?s=cd57f2c13688b7c167d166e276e92718efc6ae0a&profile_id=174',
    header_video_background_opacidad: 0.5,

    // Buscador
    buscador_tipografia: 'Roboto',
    buscador_tipografia_color: '#333',
    buscador_tipografia_color_label: '#666',
    buscador_inputColor: '#000',
    buscador_inputFondoColor: '#fff',
    buscador_color_primario: '#FF6B6B',
    buscador_color_secundario: '#FFE66D',
    buscador_color_terciario: '#6BCB77',

    // Publicidad
    publicidad_existe: true,
    publicidad_titulo: 'Explorá el mundo con nosotros',
    publicidad_tipografia_color: '#1E1E1E',
    publicidad_color_primario: '#F8E9A1',
    publicidad_color_secundario: '#F76C6C',
    publicidad_color_terciario: '#A8D0E6',

    // Tarjetas
    tarjetas_titulo: 'Destinos destacados',
    tarjetas_tipografia: 'Montserrat',
    tarjetas_tipografia_color: '#212121',
    tarjetas_tipografia_color_titulo: '#FF6B6B',
    tarjetas_tipografia_color_contenido: '#4E4E4E',
    tarjetas_color_primario: '#FFF',
    tarjetas_color_secundario: '#F0F0F0',
    tarjetas_color_terciario: '#F7D794',

    // Banner de registro
    banner_registro_titulo: 'Sumate y accedé a beneficios exclusivos',
    banner_registro_tipografia_color: '#1B1B1B',
    banner_registro_color_primario: '#FFE66D',
    banner_registro_color_secundario: '#FF6B6B',
    banner_registro_color_terciario: '#4ECDC4',

    // Quienes somos
    quienes_somos_es: 'Somos una agencia con más de 15 años conectando viajeros con experiencias únicas en todo el mundo.',
    quienes_somos_en: 'We are a travel agency with over 15 years of experience connecting travelers to unique global adventures.',
    quienes_somos_pt: 'Somos uma agência de viagens com mais de 15 anos conectando viajantes com experiências únicas ao redor do mundo.',

    // Footer
    footer_texto: 'Viajes Global Sur © 2025. Todos los derechos reservados.',
    footer_tipografia: 'Lato',
    footer_tipografia_color: '#FFFFFF',
    footer_color_primario: '#222831',
    footer_color_secundario: '#393E46',
    footer_color_terciario: '#00ADB5',

    // Contacto y redes
    footer_facebook: 'https://facebook.com/viajesglobalsur',
    footer_instagram: 'https://instagram.com/viajesglobalsur',
    footer_twitter: 'https://twitter.com/viajesglobalsur',
    footer_whatsapp: 'https://wa.me/5491122334455',
    footer_email: 'contacto@global-sur.com',
    footer_telefono: '+54 11 2233 4455',
    footer_direccion: 'Av. Corrientes 1234',
    footer_ciudad: 'Buenos Aires',
    footer_pais: 'Argentina',

    // Términos y condiciones
    terminos_y_condiciones: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',

    // Multimedia
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/User_icon_2.svg/1024px-User_icon_2.svg.png',
    header_video: 'https://cdn.pixabay.com/video/2023/03/06/155618-811508780_tiny.mp4',
    header_imagen: 'https://images.unsplash.com/photo-1502920917128-1aa500764b1c',
    publicidad_imagen_1: 'https://images.pexels.com/photos/346885/pexels-photo-346885.jpeg',
    publicidad_imagen_2: 'https://images.pexels.com/photos/1008155/pexels-photo-1008155.jpeg',
    publicidad_imagen_3: 'https://images.pexels.com/photos/21014/pexels-photo.jpg',
  },
];
