'use client';

import { Container, Stack, Typography } from '@mui/material';
import { useEffect } from 'react';
import { useUserContext } from '@/contexts/user-context';
import { useAgenciasContext } from '@/contexts/features/Agencias/AgenciaProvider';

import { TablaAgenciasResumen } from '@/components/paquetesPropios/TablaAgenciasResumen';
import ModalPaquetePropio from '@/components/paquetesPropios/modal/ModalPaquetePropio';
import ModalSalidas from '@/components/paquetesPropios/modal/ModalSalida';
import VistaPaquetesAdmin from '@/components/paquetesPropios/VistaPaquetesAdmin';

export default function PaquetesPropiosPage() {
  const { user, isLoading } = useUserContext();
  const { state, actions } = useAgenciasContext();
  const { agencias } = state;

  const esSuperadmin = user?.rol === 'superadmin';
  const esAdminConAgencia = user?.rol === 'admin' && !!user?.agencia_id;

  // 🔄 Cargar listado de agencias cuando es superadmin (como en la página de agencias)
  useEffect(() => {
    if (esSuperadmin && agencias.length === 0) {
      actions.fetchAgencias();
    }
  }, [esSuperadmin, agencias.length, actions]);

  if (isLoading) return null;

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Typography variant="h6" color="error">
          Usuario no autenticado o sin permisos.
        </Typography>
      </Container>
    );
  }

  // Alias para evitar camelcase lint al pasar props
  const agenciaId = user?.agencia_id ? String(user.agencia_id) : undefined;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Typography variant="h4" fontWeight={600}>
          Paquetes Propios {esSuperadmin ? 'por Agencia' : 'de la Agencia'}
        </Typography>

        <Typography variant="body1" color="text.secondary">
          {esSuperadmin
            ? 'Visualizá y gestioná los paquetes propios asociados a cada agencia.'
            : 'Visualizá y gestioná los paquetes propios de tu agencia.'}
        </Typography>

        {esSuperadmin && <TablaAgenciasResumen />}

        {esAdminConAgencia && agenciaId && (
          <VistaPaquetesAdmin agenciaId={agenciaId} />
        )}

        <ModalPaquetePropio />
        <ModalSalidas />
      </Stack>
    </Container>
  );
}
