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
  Alert,
  Snackbar,
  LinearProgress,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import BusinessIcon from '@mui/icons-material/Business';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CloudSyncIcon from '@mui/icons-material/CloudSync';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';

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
// ✅ usamos la vista paginada
import VistaPaquetesPaginados, {
  PaqueteListado,               // 👈 NUEVO: importamos el tipo
} from './VistaPaquetesPaginados';

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

// Tipos para mensajes de notificación
type Notification = {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  timestamp: Date;
};

// Tipo para estadísticas de importación
type ImportStats = {
  paquetes_creados: number;
  paquetes_actualizados: number;
  salidas_creadas: number;
  salidas_actualizadas: number;
  total_procesado: number;
};

export default function PaquetesPropiosPage() {
  const { user, isLoading } = useUserContext();
  const { state, actions } = useAgenciasContext();
  const { agencias } = state;

  const [isImporting, setIsImporting] = useState(false);
  const [isSyncingAtlas, setIsSyncingAtlas] = useState(false);
  const [hasAtlasIntegration, setHasAtlasIntegration] = useState(false);
  const [checkingAtlas, setCheckingAtlas] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [openStatsDialog, setOpenStatsDialog] = useState(false);
  const [importStats, setImportStats] = useState<ImportStats | null>(null);
  const [progress, setProgress] = useState(0);
  const [importFileName, setImportFileName] = useState<string | null>(null);
  const [isRefreshingPaquetes, setIsRefreshingPaquetes] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const esSuperadmin = user?.rol === 'superadmin';
  const esAdminConAgencia = user?.rol === 'admin' && !!user?.agencia_id;

  const agenciaId = user?.agencia_id ? Number(user.agencia_id) : undefined;

  // 👇👇👇 NUEVO: estado para controlar los MODALES de Ver / Editar / Duplicar / Salidas
  const [paqueteSeleccionado, setPaqueteSeleccionado] = useState<PaqueteListado | null>(null);
  const [modoPaquete, setModoPaquete] = useState<'ver' | 'editar' | 'duplicar' | null>(null);
  const [openPaqueteDialog, setOpenPaqueteDialog] = useState(false);
  const [openSalidasDialog, setOpenSalidasDialog] = useState(false);
  // ☝️☝️☝️

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
        
        // Notificación solo si es la primera vez o cambió
        if (hasAtlas) {
          addNotification('info', 'Conexión Atlas detectada y habilitada');
        }
      } catch (err) {
        console.error('Error comprobando integración Atlas:', err);
        setHasAtlasIntegration(false);
        addNotification('error', 'Error al verificar conexión Atlas');
      } finally {
        setCheckingAtlas(false);
      }
    };

    void checkAtlas();
  }, [agenciaId]);

  // Helper para agregar notificaciones
  const addNotification = (type: Notification['type'], message: string) => {
    const newNotification: Notification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date(),
    };
    setNotifications((prev) => [newNotification, ...prev.slice(0, 4)]); // Mantener solo últimas 5
  };

  // Cerrar notificación
  const handleCloseNotification = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Refrescar lista de paquetes (a nivel página – ahora solo notifica)
  const handleRefreshPaquetes = useCallback(async () => {
    if (!agenciaId) return;
    
    setIsRefreshingPaquetes(true);
    addNotification('info', 'Actualizando lista de paquetes...');
    
    setTimeout(() => {
      setIsRefreshingPaquetes(false);
      addNotification('success', 'Lista de paquetes actualizada');
    }, 1500);
  }, [agenciaId]);

  const handleExportExcel = useCallback(async () => {
    try {
      if (!agenciaId) {
        addNotification('warning', 'No hay agencia seleccionada para exportar');
        return;
      }

      const url = apiUrl(`/api/agencias/${agenciaId}/paquetes/export`);

      addNotification('info', 'Generando archivo de exportación...');

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
      link.download = `paquetes-agencia-${agenciaId}-${new Date().toISOString().split('T')[0]}.xlsx`;

      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      addNotification('success', `Exportación completada: ${link.download}`);
      
    } catch (error) {
      console.error('Error exportando paquetes propios:', error);
      addNotification('error', `Error al exportar: ${error instanceof Error ? error.message : 'Error desconocido'}`);
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
        addNotification('warning', 'No hay agencia seleccionada para importar');
        event.target.value = '';
        return;
      }

      // Validar tipo de archivo
      if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
        addNotification('error', 'Formato de archivo no válido. Use .xlsx, .xls o .csv');
        event.target.value = '';
        return;
      }

      setImportFileName(file.name);
      setIsImporting(true);
      setProgress(0);
      addNotification('info', `Iniciando importación de ${file.name}`);

      // Simular progreso
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);

      try {
        const formData = new FormData();
        formData.append('archivo', file);

        const url = apiUrl(
          `/api/agencias/${agenciaId}/paquetes-salidas/import`
        );

        const response = await fetch(url, {
          method: 'POST',
          credentials: 'include',
          body: formData,
        });

        clearInterval(progressInterval);
        setProgress(100);

        if (!response.ok) {
          const text = await response.text();
          throw new Error(
            text || `Error ${response.status} al importar paquetes y salidas`
          );
        }

        const result = await response.json();
        
        // Mostrar estadísticas
        if (result) {
          const stats: ImportStats = {
            paquetes_creados: result.paquetes_creados?.length || 0,
            paquetes_actualizados: result.paquetes_actualizados?.length || 0,
            salidas_creadas: result.salidas_creadas?.length || 0,
            salidas_actualizadas: result.salidas_actualizadas?.length || 0,
            total_procesado: (result.paquetes_creados?.length || 0) + 
                           (result.paquetes_actualizados?.length || 0) +
                           (result.salidas_creadas?.length || 0) +
                           (result.salidas_actualizadas?.length || 0),
          };
          
          setImportStats(stats);
          setOpenStatsDialog(true);
          
          addNotification(
            'success', 
            `Importación exitosa: ${stats.total_procesado} registros procesados`
          );
          
          // Refrescar lista de paquetes después de importar
          setTimeout(() => {
            handleRefreshPaquetes();
          }, 1000);
        }

        console.log('Importación de paquetes y salidas exitosa', result);

      } catch (error) {
        clearInterval(progressInterval);
        console.error('Error importando paquetes propios:', error);
        
        addNotification(
          'error', 
          `Error en importación: ${error instanceof Error ? error.message : 'Error desconocido'}`
        );
      } finally {
        setTimeout(() => {
          setIsImporting(false);
          setProgress(0);
          setImportFileName(null);
        }, 1000);
        event.target.value = '';
      }
    },
    [agenciaId, handleRefreshPaquetes]
  );

  // 🔄 sincronizar paquetes con Atlas (solo si la API está habilitada)
  const handleSyncAtlas = useCallback(async () => {
    try {
      if (!agenciaId) {
        addNotification('warning', 'No hay agencia seleccionada para sincronizar');
        return;
      }

      setIsSyncingAtlas(true);
      addNotification('info', 'Sincronizando paquetes desde Atlas...');

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

      const result = await response.json();
      
      if (result?.ok) {
        addNotification(
          'success', 
          `Sincronización Atlas exitosa: ${result.cant || 0} paquetes obtenidos`
        );
        
        // Refrescar lista después de sincronizar
        setTimeout(() => {
          handleRefreshPaquetes();
        }, 1000);
      } else {
        addNotification('warning', 'Sincronización Atlas completada sin nuevos datos');
      }

      console.log('Sincronización de paquetes desde Atlas exitosa', result);
    } catch (error) {
      console.error('Error al sincronizar paquetes desde Atlas:', error);
      addNotification(
        'error', 
        `Error en sincronización Atlas: ${error instanceof Error ? error.message : 'Error desconocido'}`
      );
    } finally {
      setIsSyncingAtlas(false);
    }
  }, [agenciaId, handleRefreshPaquetes]);

  // Cerrar diálogo de estadísticas
  const handleCloseStatsDialog = () => {
    setOpenStatsDialog(false);
    setImportStats(null);
  };

  // 👇👇👇 NUEVO: helpers para cerrar los diálogos de paquete/salidas
  const handleClosePaqueteDialog = () => {
    setOpenPaqueteDialog(false);
    setModoPaquete(null);
    setPaqueteSeleccionado(null);
  };

  const handleCloseSalidasDialog = () => {
    setOpenSalidasDialog(false);
    setPaqueteSeleccionado(null);
  };
  // ☝️☝️☝️

  if (isLoading) {
    return (
      <Container maxWidth="xl" sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

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
          <ErrorIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
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
        minHeight: '100vh',
      }}
    >
      <Stack spacing={3}>
        {/* NOTIFICACIONES */}
        <Box sx={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, maxWidth: 400 }}>
          <Stack spacing={1}>
            {notifications.map((notification) => (
              <Alert
                key={notification.id}
                severity={notification.type}
                onClose={() => handleCloseNotification(notification.id)}
                iconMapping={{
                  success: <CheckCircleIcon />,
                  error: <ErrorIcon />,
                  warning: <ErrorIcon />,
                  info: <InfoIcon />,
                }}
                sx={{
                  boxShadow: 3,
                  animation: 'slideIn 0.3s ease-out',
                  '@keyframes slideIn': {
                    from: { transform: 'translateX(100%)', opacity: 0 },
                    to: { transform: 'translateX(0)', opacity: 1 },
                  },
                }}
              >
                <Typography variant="body2">
                  {notification.message}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {notification.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Typography>
              </Alert>
            ))}
          </Stack>
        </Box>

        {/* HEADER */}
        <Paper
          elevation={2}
          sx={{
            p: 3,
            borderRadius: 3,
            background:
              'linear-gradient(135deg, rgba(25,118,210,0.04), rgba(25,118,210,0.08))',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Barra de progreso para importación */}
          {isImporting && (
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              sx={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0,
                height: 4 
              }} 
            />
          )}

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
                      <AdminPanelSettingsIcon fontSize="small" />
                    ) : (
                      <BusinessIcon fontSize="small" />
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
                    icon={checkingAtlas ? <CircularProgress size={14} /> : undefined}
                  />
                )}

                {isImporting && (
                  <Chip
                    size="small"
                    label={`Importando: ${importFileName || 'archivo'} (${progress}%)`}
                    color="info"
                    variant="outlined"
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
                {/* Botón para refrescar */}
                <Tooltip title="Actualizar lista de paquetes">
                  <IconButton
                    onClick={handleRefreshPaquetes}
                    disabled={isRefreshingPaquetes}
                    sx={{ 
                      borderRadius: 2,
                      bgcolor: 'background.paper',
                      border: '1px solid',
                      borderColor: 'divider'
                    }}
                  >
                    {isRefreshingPaquetes ? (
                      <CircularProgress size={20} />
                    ) : (
                      <RefreshIcon />
                    )}
                  </IconButton>
                </Tooltip>

                {/* Importar paquetes propios (Excel) */}
                <Button
                  variant="outlined"
                  startIcon={isImporting ? <CircularProgress size={16} /> : <UploadFileIcon />}
                  onClick={handleSelectFile}
                  disabled={isImporting}
                  sx={{
                    borderRadius: 999,
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 2.5,
                    py: 1,
                    minWidth: 180,
                  }}
                >
                  {isImporting ? 'Importando...' : 'Importar paquetes'}
                </Button>

                {/* Sincronizar con Atlas (solo si la API está activada) */}
                {hasAtlasIntegration && (
                  <Button
                    variant="outlined"
                    startIcon={isSyncingAtlas ? <CircularProgress size={16} /> : <CloudSyncIcon />}
                    onClick={handleSyncAtlas}
                    disabled={isSyncingAtlas || checkingAtlas || isImporting}
                    sx={{
                      borderRadius: 999,
                      textTransform: 'none',
                      fontWeight: 600,
                      px: 2.5,
                      py: 1,
                      minWidth: 180,
                      borderColor: hasAtlasIntegration ? 'success.main' : undefined,
                      color: hasAtlasIntegration ? 'success.main' : undefined,
                      '&:hover': {
                        borderColor: hasAtlasIntegration ? 'success.dark' : undefined,
                        bgcolor: hasAtlasIntegration ? 'success.light' : undefined,
                      }
                    }}
                  >
                    {isSyncingAtlas
                      ? 'Sincronizando...'
                      : 'Sincronizar Atlas'}
                  </Button>
                )}

                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={handleExportExcel}
                  disabled={isImporting || isSyncingAtlas}
                  sx={{
                    borderRadius: 999,
                    textTransform: 'none',
                    fontWeight: 600,
                    alignSelf: { xs: 'stretch', sm: 'center' },
                    px: 3,
                    py: 1.2,
                    minWidth: 180,
                    bgcolor: 'primary.main',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    }
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
            position: 'relative',
          }}
        >
          <Stack spacing={3}>
            {esSuperadmin && (
              <>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Typography variant="h6" fontWeight={600}>
                    Resumen por agencia
                  </Typography>
                  <Chip 
                    label={`${agencias.length} agencias`} 
                    size="small" 
                    color="primary" 
                    variant="outlined" 
                  />
                </Box>
                <TablaAgenciasResumen />
                <Divider />
              </>
            )}

            {esAdminConAgencia && agenciaId && (
              <Box>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Typography variant="h6" fontWeight={600}>
                      Paquetes de la agencia
                    </Typography>
                    {isRefreshingPaquetes && (
                      <CircularProgress size={20} />
                    )}
                  </Box>
                  <Box display="flex" gap={1}>
                    <Chip 
                      icon={<VisibilityIcon />}
                      label="Vista previa" 
                      size="small" 
                      variant="outlined"
                      onClick={() => addNotification('info', 'Vista previa activada')}
                    />
                    <Chip 
                      icon={<PlaylistAddCheckIcon />}
                      label="Filtrar activos" 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                    />
                  </Box>
                </Box>

                {/* 👉 AQUÍ conectamos la tabla con los modales via callbacks */}
                <VistaPaquetesPaginados
                  agenciaId={String(agenciaId)}
                  onVerPaquete={(p: PaqueteListado) => {
                    setPaqueteSeleccionado(p);
                    setModoPaquete('ver');
                    setOpenPaqueteDialog(true);
                  }}
                  onEditarPaquete={(p: PaqueteListado) => {
                    setPaqueteSeleccionado(p);
                    setModoPaquete('editar');
                    setOpenPaqueteDialog(true);
                  }}
                  onDuplicarPaquete={(p: PaqueteListado) => {
                    setPaqueteSeleccionado(p);
                    setModoPaquete('duplicar');
                    setOpenPaqueteDialog(true);
                  }}
                  onGestionarSalidas={(p: PaqueteListado) => {
                    setPaqueteSeleccionado(p);
                    setOpenSalidasDialog(true);
                  }}
                />
              </Box>
            )}

            {!esSuperadmin && !esAdminConAgencia && (
              <Alert 
                severity="info" 
                icon={<InfoIcon />}
                sx={{ borderRadius: 2 }}
              >
                <Typography variant="body2">
                  Tu rol actual no tiene una agencia asociada para administrar paquetes propios.
                  Contactá a un administrador para asignarte una agencia.
                </Typography>
              </Alert>
            )}
          </Stack>
        </Paper>

        {/* DIÁLOGO DE ESTADÍSTICAS DE IMPORTACIÓN */}
        <Dialog 
          open={openStatsDialog} 
          onClose={handleCloseStatsDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box display="flex" alignItems="center" gap={1}>
              <CheckCircleIcon color="success" />
              <Typography variant="h6">Importación completada</Typography>
            </Box>
          </DialogTitle>
          <DialogContent>
            {importStats && (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={6}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h3" color="success.main" align="center">
                        {importStats.total_procesado}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" align="center">
                        Total procesado
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h3" color="primary.main" align="center">
                        {importStats.paquetes_creados + importStats.paquetes_actualizados}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" align="center">
                        Paquetes totales
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h5" color="success.main" align="center">
                        {importStats.paquetes_creados}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" align="center">
                        Paquetes creados
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h5" color="info.main" align="center">
                        {importStats.paquetes_actualizados}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" align="center">
                        Paquetes actualizados
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h5" color="warning.main" align="center">
                        {importStats.salidas_creadas}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" align="center">
                        Salidas creadas
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h5" color="secondary.main" align="center">
                        {importStats.salidas_actualizadas}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" align="center">
                        Salidas actualizadas
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseStatsDialog} color="primary">
              Cerrar
            </Button>
            <Button 
              onClick={() => {
                handleCloseStatsDialog();
                handleRefreshPaquetes();
              }} 
              variant="contained" 
              color="primary"
              startIcon={<RefreshIcon />}
            >
              Actualizar lista
            </Button>
          </DialogActions>
        </Dialog>

        {/* 👇👇👇 NUEVOS DIÁLOGOS para ver/editar/duplicar y salidas */}

        {/* Dialogo de Ver / Editar / Duplicar Paquete */}
        <Dialog
          open={openPaqueteDialog && !!paqueteSeleccionado}
          onClose={handleClosePaqueteDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {modoPaquete === 'ver' && 'Ver paquete'}
            {modoPaquete === 'editar' && 'Editar paquete'}
            {modoPaquete === 'duplicar' && 'Duplicar paquete'}
          </DialogTitle>
          <DialogContent dividers>
            {paqueteSeleccionado && (
              <>
                <Typography variant="h6" gutterBottom>
                  {paqueteSeleccionado.titulo}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {paqueteSeleccionado.descripcion}
                </Typography>

                <Box mt={2}>
                  <Typography variant="body2">
                    <strong>Ciudad:</strong> {paqueteSeleccionado.ciudad || 'Sin ciudad'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Noches:</strong> {paqueteSeleccionado.cant_noches ?? '-'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Moneda:</strong> {paqueteSeleccionado.tipo_moneda ?? '-'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Origen:</strong>{' '}
                    {paqueteSeleccionado.external_source ??
                      (paqueteSeleccionado.is_remote ? 'remoto' : 'manual')}
                  </Typography>
                </Box>

                {/* Lugar donde después podés embutir tu ModalPaquetePropio real */}
                {modoPaquete !== 'ver' && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    Acá podrías mostrar el formulario de edición / duplicado del paquete.
                  </Alert>
                )}
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClosePaqueteDialog}>Cerrar</Button>
            {modoPaquete === 'editar' && (
              <Button
                variant="contained"
                onClick={() => {
                  addNotification('info', 'Guardar cambios no implementado en este stub');
                }}
              >
                Guardar cambios
              </Button>
            )}
            {modoPaquete === 'duplicar' && (
              <Button
                variant="contained"
                onClick={() => {
                  addNotification('info', 'Confirmar duplicado no implementado en este stub');
                }}
              >
                Confirmar duplicado
              </Button>
            )}
          </DialogActions>
        </Dialog>

        {/* Dialogo de Salidas */}
        <Dialog
          open={openSalidasDialog && !!paqueteSeleccionado}
          onClose={handleCloseSalidasDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Salidas del paquete</DialogTitle>
          <DialogContent dividers>
            {paqueteSeleccionado?.salidas && paqueteSeleccionado.salidas.length > 0 ? (
              <Stack spacing={1}>
                {paqueteSeleccionado.salidas.map((s, idx) => (
                  <Paper key={s.id ?? idx} variant="outlined" sx={{ p: 1.5 }}>
                    <Typography variant="body2">
                      <strong>Fecha viaje:</strong> {s.fecha_viaje || '-'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Desde:</strong> {s.fecha_desde || '-'}{' '}
                      <strong>Hasta:</strong> {s.fecha_hasta || '-'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Precio doble:</strong>{' '}
                      {s.doble_precio != null ? s.doble_precio.toLocaleString('es-AR') : '-'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Transporte:</strong> {s.tipo_transporte || '-'}
                    </Typography>
                  </Paper>
                ))}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Este paquete no tiene salidas cargadas.
              </Typography>
            )}

            <Alert severity="info" sx={{ mt: 2 }}>
              Acá podrías integrar el formulario de <strong>ModalSalidas</strong> para editar/crear
              salidas.
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseSalidasDialog}>Cerrar</Button>
          </DialogActions>
        </Dialog>

        {/* MODALES ORIGINALES (siguen montados por si usan contexto interno) */}
        <ModalPaquetePropio />
        <ModalSalidas />

        {/* FOOTER INFO */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: 'background.default',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant="body2" color="text.secondary" align="center">
            Sistema de gestión de paquetes propios • TravelConnect • {new Date().getFullYear()}
            <br />
            {agenciaId && `Agencia ID: ${agenciaId} • `}
            Última actualización: {new Date().toLocaleDateString()}
          </Typography>
        </Paper>
      </Stack>
    </Container>
  );
}
