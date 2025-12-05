'use client';

import {
  Container,
  Stack,
  Typography,
  Button,
  Box,
  Paper,
  Chip,
  Divider,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import BusinessIcon from '@mui/icons-material/Business';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { useEffect, useCallback } from 'react';
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

  const agenciaId = user?.agencia_id ? String(user.agencia_id) : undefined;

  // 🔄 Cargar listado de agencias cuando es superadmin
  useEffect(() => {
    if (esSuperadmin && agencias.length === 0) {
      actions.fetchAgencias();
    }
  }, [esSuperadmin, agencias.length, actions]);

  const handleExportExcel = useCallback(async () => {
    try {
      if (!agenciaId) {
        console.warn(
          'No hay agencia_id disponible para exportar paquetes propios.'
        );
        return;
      }

      const url = `https://travelconnect.com.ar/api/agencias/${agenciaId}/paquetes/export`;

      const response = await fetch(url, {
        method: 'GET',
        // si necesitás cookies / sesión del dominio principal:
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(
          `Error ${response.status} al exportar paquetes propios`
        );
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = downloadUrl;
      link.download = `paquetes-agencia-${agenciaId}.xlsx`;

      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error exportando paquetes propios:', error);
      // acá podés disparar un snackbar/toast si ya tenés uno
    }
  }, [agenciaId]);

  if (isLoading) return null;

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Paper
          elevation={3}
          sx={{
            p: 4,
            textAlign: 'center',
            borderRadius: 3,
          }}
        >
          <Typography variant="h6" color="error" gutterBottom>
            Usuario no autenticado o sin permisos.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Iniciá sesión nuevamente o contactá a un administrador.
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container
      maxWidth="xl"
      sx={{
        py: 4,
        pb: 6,
      }}
    >
      <Stack spacing={3}>
        {/* HEADER */}
        <Paper
          elevation={2}
          sx={{
            p: 3,
            borderRadius: 3,
            background:
              'linear-gradient(135deg, rgba(25,118,210,0.04), rgba(25,118,210,0.08))',
          }}
        >
          <Box
            display="flex"
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            justifyContent="space-between"
            flexDirection={{ xs: 'column', sm: 'row' }}
            gap={2.5}
          >
            <Box display="flex" flexDirection="column" gap={1}>
              <Typography variant="h4" fontWeight={600}>
                Paquetes Propios {esSuperadmin ? 'por Agencia' : 'de la Agencia'}
              </Typography>

              <Typography variant="body1" color="text.secondary">
                {esSuperadmin
                  ? 'Visualizá y gestioná los paquetes propios asociados a cada agencia.'
                  : 'Visualizá y gestioná los paquetes propios de tu agencia.'}
              </Typography>

              <Box display="flex" gap={1} flexWrap="wrap" mt={0.5}>
                <Chip
                  icon={
                    esSuperadmin ? (
                      <AdminPanelSettingsIcon />
                    ) : (
                      <BusinessIcon />
                    )
                  }
                  label={
                    esSuperadmin
                      ? 'Rol: Superadmin'
                      : esAdminConAgencia && agenciaId
                      ? `Agencia ID: ${agenciaId}`
                      : `Rol: ${user.rol ?? 'N/A'}`
                  }
                  size="small"
                  variant="outlined"
                />
              </Box>
            </Box>

            {/* Botón de exportar solo si sabemos qué agencia exportar */}
            {agenciaId && (
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={handleExportExcel}
                sx={{
                  borderRadius: 999,
                  textTransform: 'none',
                  fontWeight: 600,
                  alignSelf: { xs: 'stretch', sm: 'center' },
                  px: 3,
                  py: 1.2,
                }}
              >
                Exportar Excel
              </Button>
            )}
          </Box>
        </Paper>

        {/* CONTENIDO PRINCIPAL */}
        <Paper
          elevation={1}
          sx={{
            p: 3,
            borderRadius: 3,
          }}
        >
          <Stack spacing={3}>
            {esSuperadmin && (
              <>
                <Typography variant="h6" fontWeight={600}>
                  Resumen por agencia
                </Typography>
                <TablaAgenciasResumen />
                <Divider />
              </>
            )}

            {esAdminConAgencia && agenciaId && (
              <Box>
                <Typography variant="h6" fontWeight={600} mb={1.5}>
                  Paquetes de la agencia
                </Typography>
                <VistaPaquetesAdmin agenciaId={agenciaId} />
              </Box>
            )}

            {!esSuperadmin && !esAdminConAgencia && (
              <Typography variant="body2" color="text.secondary">
                Tu rol actual no tiene una agencia asociada para administrar
                paquetes propios.
              </Typography>
            )}
          </Stack>
        </Paper>

        {/* MODALES */}
        <ModalPaquetePropio />
        <ModalSalidas />
      </Stack>
    </Container>
  );
}
