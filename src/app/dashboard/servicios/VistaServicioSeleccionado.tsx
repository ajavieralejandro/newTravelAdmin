// src/app/dashboard/servicios/VistaServicioSeleccionado.tsx
'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import type { AgenciaBackData } from '@/types/AgenciaBackData';
import { useUserContext } from '@/contexts/user-context';

import { VistaApisServicio } from '@/components/ConfigAgencia/VistaApisServicio';
import { TablaAgenciasApis } from './TablaAgenciasApis';
import { TablaAgenciasAtlas } from './TablaAgenciasAtlas';
import { VistaAtlasServicio } from '@/components/ConfigAgencia/VistaAtlasServicio';

type Props = {
  seccion: string;
  agencia: AgenciaBackData;
};

export function VistaServicioSeleccionado({ seccion, agencia }: Props): React.JSX.Element {
  const { user } = useUserContext();
  const esSuperadmin = user?.rol === 'superadmin';

  if (seccion === 'APIs de terceros') {
    return esSuperadmin ? <TablaAgenciasApis /> : <VistaApisServicio agenciaId={agencia.idAgencia} />;
  }

  if (seccion === 'CRM Atlas') {
    return esSuperadmin ? <TablaAgenciasAtlas /> : <VistaAtlasServicio agenciaId={agencia.idAgencia} />;
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="body2" color="text.secondary">
        Seleccioná una sección de la barra superior para configurar.
      </Typography>
    </Box>
  );
}
