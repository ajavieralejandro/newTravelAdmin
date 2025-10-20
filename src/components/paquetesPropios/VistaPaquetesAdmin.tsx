'use client';

import React, { useEffect } from 'react';
import { Box, Container, Paper, Typography, Divider } from '@mui/material';
import { Buildings } from '@phosphor-icons/react';

import { SubtablaPaquetes } from '@/components/paquetesPropios/SubtablaPaquetes';
import { usePaquetesPropios } from '@/contexts/features/PaquetesPropiosProvider/usePaquetesPropios';

interface VistaPaquetesAdminProps {
  agenciaId: string;
}

const VistaPaquetesAdmin: React.FC<VistaPaquetesAdminProps> = ({ agenciaId }) => {
  const { fetchPaquetesDeAgencia, paquetesPorAgencia } = usePaquetesPropios();

  useEffect(() => {
  if (!paquetesPorAgencia[agenciaId]) {
    fetchPaquetesDeAgencia(agenciaId);
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [agenciaId]); // 👈 dependencia reducida


  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <Buildings size={28} weight="duotone" />
          <Typography variant="h5" fontWeight={600}>
            Panel de Paquetes Propios
          </Typography>
        </Box>

        <Typography variant="body1" color="text.secondary" mb={3}>
          Aquí podés gestionar los paquetes propios asociados a tu agencia.
        </Typography>

        <Divider sx={{ mb: 3 }} />

        <SubtablaPaquetes agenciaId={agenciaId} nombreAgencia="Mi Agencia" />
      </Paper>
    </Container>
  );
};

export default VistaPaquetesAdmin;
