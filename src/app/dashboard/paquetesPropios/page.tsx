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
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CloudSyncIcon from '@mui/icons-material/CloudSync';

import {
  useEffect,
  useCallback,
  useState,
  useRef,
  ChangeEvent,
} from 'react';
import { useUserContext } from '@/contexts/user-context';
import { useAgenciasContext } from '@/contexts/features/Agencias/AgenciaProvider';

import { TablaAgenciasResumen } from '@/components/paquetesPropios/TablaAgenciasResumen';
import ModalPaquetePropio from '@/components/paquetesPropios/modal/ModalPaquetePropio';
import ModalSalidas from '@/components/paquetesPropios/modal/ModalSalida';
import VistaPaquetesAdmin from '@/components/paquetesPropios/VistaPaquetesAdmin';

/* ============================
   Helper API igual que en integraciones
============================ */

// Base ABSOLUTA al backend
const RAW_BASE = (process.env.NEXT_PUBLIC_API_BASE ?? '').trim();
const API_BASE =
  RAW_BASE !== '' ? RAW_BASE.replace(/\/+$/, '') : 'https://travelconnect.com.ar';

const apiUrl = (path: string) =>
  `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;

const normalize = (s?: string | null) =>
  (s ?? '').toLowerCase().replace(/[\s_-]/g, '');

// Tipo que devuelve /apis y /api_agencias/{id}/apis
type ApiItem = {
  id: number;
  nombre: string;
  descripcion?: string | null;
  endpoint?: string | null;
  slug?: string | null;
};

/**
 * Igual que en ApiIntegrationsPanel: detectamos si una API es Atlas.
 */
function isAtlasApi(api: ApiItem): boolean {
  const n = normalize(api.nombre);
  const e = (api.endpoint ?? '').toLowerCase();

  if (n.includes('atlas') || e.includes('api-atlas') || e.includes('netviax')) {
    return true;
  }
  return false;
}

export default function PaquetesPropiosPage() {
  const { user, isLoading } = useUserContext();
  const { state, actions } = useAgenciasContext();
  const { agencias } = state;

  const [isImporting, setIsImporting] = useState(false);
  const [isSyncingAtlas, setIsSyncingAtlas] = useState(false);
  const [hasAtlasIntegration, setHasAtlasIntegration] = useState(false);
  const [checkingAtlas, setCheckingAtlas] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const esSuperadmin = user?.rol === 'superadmin';
  const esAdminConAgencia = user?.rol === 'admin' && !!user?.agencia_id;

  const agenciaId = user?.agencia_id ? Number(user.agencia_id) : undefined;

  // 🔄 Cargar listado de agencias cuando es superadmin
  useEffect(() => {
    if (esSuperadmin && agencias.length === 0) {
      actions.fetchAgencias();
    }
  }, [esSuperadmin, agencias.length, actions]);

  // 🔍 Ver si la agencia tiene la API de Atlas habilitada
  useEffect(() => {
    const checkAtlas = async () => {
      if (!agenciaId) {
        setHasAtlasIntegration(false);
        return;
      }
      setCheckingAtlas(true);
      try {
        const r = await fetch(apiUrl(`/api_agencias/${agenciaId}/apis`), {
          credentials: 'include',
        });
        if (!r.ok) {
          throw new Error(
            `GET /api_agencias/${agenciaId}/apis → ${r.status}`
          );
        }
        const apis: ApiItem[] = await r.json();
        const hasAtlas = apis.some((api) => isAtlasApi(api));
        setHasAtlasIntegration(hasAtlas);
      } catch (err) {
        console.error('Error comprobando integración Atlas:', err);
        setHasAtlasIntegration(false);
      } finally {
        setCheckingAtlas(false);
      }
    };

    void checkAtlas();
  }, [agenciaId]);

  const handleExportExcel = useCallback(async () => {
    try {
      if (!agenciaId) {
        console.warn(
          'No hay agencia_id disponible para exportar paquetes propios.'
        );
        return;
      }

      const url = apiUrl(`/api/agencias/${agenciaId}/paquetes/export`);

      const response = await fetch(url, {
        method: 'GET',
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
      // TODO: snackbar/toast si lo tenés
    }
  }, [agenciaId]);

  // 📥 abrir selector de archivo
  const handleSelectFile = () => {
    fileInputRef.current?.click();
  };

  // 📥 importar Excel (Paquetes + Salidas)
  const handleImportExcel = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      if (!agenciaId) {
        console.warn(
          'No hay agencia_id disponible para importar paquetes propios.'
        );
        event.target.value = '';
        return;
      }

      setIsImporting(true);

      try {
        const formData = new FormData();
        formData.append('archivo', file);

        // 👉 ahora usamos la ruta con agencia: POST /api/agencias/{agencia}/paquetes-salidas/import
        const url = apiUrl(
          `/api/agencias/${agenciaId}/paquetes-salidas/import`
        );

        const response = await fetch(url, {
          method: 'POST',
          credentials: 'include',
          body: formData,
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(
            text || `Error ${response.status} al importar paquetes y salidas`
          );
        }

        console.log('Importación de paquetes y salidas exitosa');
        // TODO: refrescar listado de paquetes
      } catch (error) {
        console.error('Error importando paquetes propios:', error);
      } finally {
        setIsImporting(false);
        // permitir volver a elegir el mismo archivo
        event.target.value = '';
      }
    },
    [agenciaId]
  );

  // 🔄 sincronizar paquetes con Atlas (solo si la API está habilitada)
  const handleSyncAtlas = useCallback(async () => {
    try {
      if (!agenciaId) {
        console.warn(
          'No hay agencia_id disponible para sincronizar paquetes de Atlas.'
        );
        return;
      }

      setIsSyncingAtlas(true);

      // Endpoint backend para traer paquetes de Atlas y crear "propios"
      const url = apiUrl(
        `/api/agencias/${agenciaId}/paquetes/atlas-import`
      );

      const response = await fetch(url, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(
          text ||
            `Error ${response.status} al sincronizar paquetes desde Atlas`
        );
      }

      console.log('Sincronización de paquetes desde Atlas exitosa');
      // TODO: refrescar listado de paquetes propios
    } catch (error) {
      console.error('Error al sincronizar paquetes desde Atlas:', error);
    } finally {
      setIsSyncingAtlas(false);
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

                {agenciaId && (
                  <Chip
                    size="small"
                    label={
                      checkingAtlas
                        ? 'Verificando Atlas...'
                        : hasAtlasIntegration
                        ? 'Atlas habilitado'
                        : 'Atlas no habilitado'
                    }
                    color={
                      checkingAtlas
                        ? 'default'
                        : hasAtlasIntegration
                        ? 'success'
                        : 'default'
                    }
                    variant={hasAtlasIntegration ? 'filled' : 'outlined'}
                  />
                )}
              </Box>
            </Box>

            {/* Acciones principales */}
            {agenciaId && (
              <Box
                display="flex"
                flexDirection={{ xs: 'column', sm: 'row' }}
                gap={1}
                alignItems={{ xs: 'stretch', sm: 'center' }}
              >
                {/* Importar paquetes propios (Excel) */}
                <Button
                  variant="outlined"
                  startIcon={<UploadFileIcon />}
                  onClick={handleSelectFile}
                  disabled={isImporting}
                  sx={{
                    borderRadius: 999,
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 2.5,
                    py: 1,
                  }}
                >
                  {isImporting ? 'Importando...' : 'Importar paquetes'}
                </Button>

                {/* Sincronizar con Atlas (solo si la API está activada) */}
                {hasAtlasIntegration && (
                  <Button
                    variant="outlined"
                    startIcon={<CloudSyncIcon />}
                    onClick={handleSyncAtlas}
                    disabled={isSyncingAtlas || checkingAtlas}
                    sx={{
                      borderRadius: 999,
                      textTransform: 'none',
                      fontWeight: 600,
                      px: 2.5,
                      py: 1,
                    }}
                  >
                    {isSyncingAtlas
                      ? 'Sincronizando...'
                      : 'Sincronizar con Atlas'}
                  </Button>
                )}

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
              </Box>
            )}
          </Box>
        </Paper>

        {/* INPUT oculto para subir archivo */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImportExcel}
          accept=".xlsx,.xls,.csv"
          style={{ display: 'none' }}
        />

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
                <VistaPaquetesAdmin agenciaId={String(agenciaId)} />
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
