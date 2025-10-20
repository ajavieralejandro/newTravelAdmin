// src/app/dashboard/servicios/page.tsx
'use client';

import React, { useEffect } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';

import { ServiciosNavbar } from './ServiciosNavbar';
import { VistaServicioSeleccionado } from './VistaServicioSeleccionado';
import { useServiciosUI } from './useServiciosUI';

import { useUserContext } from '@/contexts/user-context';
import { useAgenciasContext } from '@/contexts/features/Agencias/AgenciaProvider';

export default function ServiciosPage() {
  const { secciones, seccionActiva, setSeccionActiva, seccionHabilitada } = useServiciosUI();
  const { isLoading, error, agenciaRaw, user } = useUserContext();

  // 👇 Traemos agencias al entrar si es superadmin
  const {
    state: { agencias },
    actions,
  } = useAgenciasContext();

  const esSuperadmin = user?.rol === 'superadmin';

  useEffect(() => {
    // Evita refetches innecesarios
    if (esSuperadmin && Array.isArray(agencias) && agencias.length === 0) {
      actions?.fetchAgencias?.().catch((e: unknown) => {
        console.error('[ServiciosPage] Error al cargar agencias:', e);
      });
    }
    // deps minimizadas para no entrar en loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [esSuperadmin]);

  if (isLoading || !agenciaRaw) return null;

  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" gutterBottom>
          Configuración de Servicios de Agencia
        </Typography>

        <Divider sx={{ my: 3 }} />

        <ServiciosNavbar
          secciones={secciones}
          seccionSeleccionada={seccionActiva}
          onSeleccionarSeccion={setSeccionActiva}
          seccionHabilitada={seccionHabilitada}
          onImplementarCambios={() => {
            console.log('Implementar cambios clickeado');
          }}
        />

        <Box sx={{ mt: 4 }}>
          <VistaServicioSeleccionado
            seccion={seccionActiva}
            agencia={agenciaRaw}
          />
        </Box>
      </Container>
    </Box>
  );
}
