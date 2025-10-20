// src/app/dashboard/servicios/index.ts
'use client';

import { Typography } from '@mui/material';
import { useUserContext } from '@/contexts/user-context';
import type { AgenciaBackData } from '@/types/AgenciaBackData';

import PaquetesPropios from './PaquetesPropios';
import { VistaApisServicio } from '@/components/ConfigAgencia/VistaApisServicio';
import { TablaAgenciasAtlas } from './TablaAgenciasAtlas';
import { VistaAtlasServicio } from '@/components/ConfigAgencia/VistaAtlasServicio';

interface VistaServicioProps {
  agencia?: AgenciaBackData;          // usado por varias vistas
  agenciaId?: string | number;        // contrato unificado para sub-vistas
}

// Wrapper para compatibilizar el registro con el contrato unificado (agenciaId)
export const VistaApisTerceros: React.FC<VistaServicioProps> = ({ agencia, agenciaId }) => {
  const id = agenciaId ?? agencia?.idAgencia ?? '';
  return <VistaApisServicio agenciaId={id} />;
};

// Wrapper con ruteo por rol para CRM Atlas:
// - superadmin → tabla de agencias con subtabla
// - admin      → vista directa de su agencia
export const VistaCrmAtlas: React.FC<VistaServicioProps> = ({ agencia, agenciaId }) => {
  const { user } = useUserContext();
  const esSuperadmin = user?.rol === 'superadmin';
  const id = agenciaId ?? agencia?.idAgencia ?? '';
  return esSuperadmin ? <TablaAgenciasAtlas /> : <VistaAtlasServicio agenciaId={id} />;
};

export const VistaHoteleria: React.FC<VistaServicioProps> = () => (
  <Typography variant="body2">
    Aquí irá la configuración de <strong>Hotelería</strong>.
  </Typography>
);

export const VistaCircuitos: React.FC<VistaServicioProps> = () => (
  <Typography variant="body2">
    Aquí irá la configuración de <strong>Circuitos</strong>.
  </Typography>
);

export const VistaVuelos: React.FC<VistaServicioProps> = () => (
  <Typography variant="body2">
    Aquí irá la configuración de <strong>Vuelos</strong>.
  </Typography>
);

export const VistaMercadoPago: React.FC<VistaServicioProps> = () => (
  <Typography variant="body2">
    Aquí irá la configuración de <strong>MercadoPago</strong>.
  </Typography>
);

export const VistasServicios: Record<string, React.FC<VistaServicioProps>> = {
  'APIs de terceros': VistaApisTerceros,
  'Paquetes propios': PaquetesPropios as React.FC<VistaServicioProps>,
  'CRM Atlas': VistaCrmAtlas,
  'Hotelería': VistaHoteleria,
  'Circuitos': VistaCircuitos,
  'Vuelos': VistaVuelos,
  'MercadoPago': VistaMercadoPago,
};
