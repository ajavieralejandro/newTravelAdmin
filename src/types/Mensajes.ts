// types/Mensajes.ts

export type MensajesTab = 'consultas' | 'reservas' | 'emails';

export type EmailRegistrado = {
  id: number;
  agencia_id: number;
  email: string;
  created_at: string;
  updated_at: string;
};

export type Consulta = {
  id: number;
  agencia_id: number;
  paquete_id: number;
  nombre_apellido: string;
  email: string;
  telefono: string;
  direccion: string | null;
  pais: string | null;
  ciudad: string | null;
  comentarios: string | null;
  created_at: string; // ISO/Laravel datetime
  updated_at: string; // ISO/Laravel datetime
};

export type Reserva = {
  id: number;
  agencia_id: number;
  paquete_id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  pasaporte: string | null;
  fecha_nacimiento: string | null; // YYYY-MM-DD
  created_at: string; // ISO/Laravel datetime
  updated_at: string; // ISO/Laravel datetime
};
