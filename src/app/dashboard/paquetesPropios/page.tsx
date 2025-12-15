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
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import AddIcon from '@mui/icons-material/Add';

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

import VistaPaquetesPaginados, { PaqueteListado } from './VistaPaquetesPaginados';

import { usePaquetesPropios } from '@/contexts/features/PaquetesPropiosProvider/usePaquetesPropios';

/* ============================
   Helper API igual que en integraciones
============================ */

const RAW_BASE = (process.env.NEXT_PUBLIC_API_BASE ?? '').trim();
const API_BASE =
  RAW_BASE !== '' ? RAW_BASE.replace(/\/+$/, '') : 'https://travelconnect.com.ar';

const apiUrl = (path: string) =>
  `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;

const normalize = (s?: string | null) =>
  (s ?? '').toLowerCase().replace(/[\s_-]/g, '');

type ApiItem = {
  id: number;
  nombre: string;
  descripcion?: string | null;
  endpoint?: string | null;
  slug?: string | null;
};

function isAtlasApi(api: ApiItem): boolean {
  const n = normalize(api.nombre);
  const e = (api.endpoint ?? '').toLowerCase();
  return n.includes('atlas') || e.includes('api-atlas') || e.includes('netviax');
}

type Notification = {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  timestamp: Date;
};

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

  // ✅ Contexto de paquetes propios
  const {
    abrirModal,
    setPaqueteSeleccionado,
    setPaqueteADuplicar,
    setPaqueteActivoParaSalidas,
    setIdAgenciaEnCreacion,
  } = usePaquetesPropios() as any;

  useEffect(() => {
    if (esSuperadmin && agencias.length === 0) {
      actions.fetchAgencias();
    }
  }, [esSuperadmin, agencias.length, actions]);

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
        if (!r.ok) throw new Error(`GET /api_agencias/${agenciaId}/apis → ${r.status}`);
        const apis: ApiItem[] = await r.json();
        const hasAtlas = apis.some((api) => isAtlasApi(api));
        setHasAtlasIntegration(hasAtlas);
        if (hasAtlas) addNotification('info', 'Conexión Atlas detectada y habilitada');
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

  const addNotification = (type: Notification['type'], message: string) => {
    const newNotification: Notification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date(),
    };
    setNotifications((prev) => [newNotification, ...prev.slice(0, 4)]);
  };

  const handleCloseNotification = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // ✅ Traer paquete completo (clave para que el form se precargue)
  const fetchPaqueteFull = useCallback(async (paqueteId: number | string) => {
    const url = apiUrl(`/get_paquete2/${paqueteId}`);
    const r = await fetch(url, {
      credentials: 'include',
      headers: { Accept: 'application/json' },
    });
    if (!r.ok) throw new Error(`No se pudo obtener paquete (${r.status})`);
    return await r.json();
  }, []);

  const handleRefreshPaquetes = useCallback(async () => {
    if (!agenciaId) return;

    setIsRefreshingPaquetes(true);
    addNotification('info', 'Actualizando lista de paquetes...');
    window.dispatchEvent(new Event('paquetes-propios:updated'));

    setTimeout(() => {
      setIsRefreshingPaquetes(false);
      addNotification('success', 'Lista de paquetes actualizada');
    }, 700);
  }, [agenciaId]);

  const handleExportExcel = useCallback(async () => {
    try {
      if (!agenciaId) {
        addNotification('warning', 'No hay agencia seleccionada para exportar');
        return;
      }

      const url = apiUrl(`/api/agencias/${agenciaId}/paquetes/export`);
      addNotification('info', 'Generando archivo de exportación...');

      const response = await fetch(url, { method: 'GET', credentials: 'include' });
      if (!response.ok) throw new Error(`Error ${response.status} al exportar paquetes propios`);

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

  const handleSelectFile = () => fileInputRef.current?.click();

  const handleImportExcel = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      if (!agenciaId) {
        addNotification('warning', 'No hay agencia seleccionada para importar');
        event.target.value = '';
        return;
      }

      if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
        addNotification('error', 'Formato de archivo no válido. Use .xlsx, .xls o .csv');
        event.target.value = '';
        return;
      }

      setImportFileName(file.name);
      setIsImporting(true);
      setProgress(0);
      addNotification('info', `Iniciando importación de ${file.name}`);

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

        const url = apiUrl(`/api/agencias/${agenciaId}/paquetes-salidas/import`);
        const response = await fetch(url, { method: 'POST', credentials: 'include', body: formData });

        clearInterval(progressInterval);
        setProgress(100);

        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || `Error ${response.status} al importar paquetes y salidas`);
        }

        const result = await response.json();

        if (result) {
          const stats: ImportStats = {
            paquetes_creados: result.paquetes_creados?.length || 0,
            paquetes_actualizados: result.paquetes_actualizados?.length || 0,
            salidas_creadas: result.salidas_creadas?.length || 0,
            salidas_actualizadas: result.salidas_actualizadas?.length || 0,
            total_procesado:
              (result.paquetes_creados?.length || 0) +
              (result.paquetes_actualizados?.length || 0) +
              (result.salidas_creadas?.length || 0) +
              (result.salidas_actualizadas?.length || 0),
          };

          setImportStats(stats);
          setOpenStatsDialog(true);
          addNotification('success', `Importación exitosa: ${stats.total_procesado} registros procesados`);

          setTimeout(() => handleRefreshPaquetes(), 500);
        }
      } catch (error) {
        clearInterval(progressInterval);
        console.error('Error importando paquetes propios:', error);
        addNotification('error', `Error en importación: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      } finally {
        setTimeout(() => {
          setIsImporting(false);
          setProgress(0);
          setImportFileName(null);
        }, 900);
        event.target.value = '';
      }
    },
    [agenciaId, handleRefreshPaquetes]
  );

  const handleSyncAtlas = useCallback(async () => {
    try {
      if (!agenciaId) {
        addNotification('warning', 'No hay agencia seleccionada para sincronizar');
        return;
      }

      setIsSyncingAtlas(true);
      addNotification('info', 'Sincronizando paquetes desde Atlas...');

      const url = apiUrl(`/api/agencias/${agenciaId}/paquetes/atlas-import`);
      const response = await fetch(url, { method: 'POST', credentials: 'include' });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Error ${response.status} al sincronizar paquetes desde Atlas`);
      }

      const result = await response.json();

      if (result?.ok) {
        addNotification('success', `Sincronización Atlas exitosa: ${result.cant || 0} paquetes obtenidos`);
        setTimeout(() => handleRefreshPaquetes(), 500);
      } else {
        addNotification('warning', 'Sincronización Atlas completada sin nuevos datos');
      }
    } catch (error) {
      console.error('Error al sincronizar paquetes desde Atlas:', error);
      addNotification('error', `Error en sincronización Atlas: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setIsSyncingAtlas(false);
    }
  }, [agenciaId, handleRefreshPaquetes]);

  const handleCloseStatsDialog = () => {
    setOpenStatsDialog(false);
    setImportStats(null);
  };

  // ✅ BOTÓN: crear paquete propio (abre el MISMO form vacío)
  const handleCrearPaquete = () => {
    if (!agenciaId) return;

    setIdAgenciaEnCreacion?.(String(agenciaId));
    setPaqueteSeleccionado?.(null);
    setPaqueteADuplicar?.(null);
    abrirModal?.();
  };

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
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
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
    <Container maxWidth="xl" sx={{ py: 4, pb: 6, minHeight: '100vh' }}>
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
                <Typography variant="body2">{notification.message}</Typography>
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
            background: 'linear-gradient(135deg, rgba(25,118,210,0.04), rgba(25,118,210,0.08))',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {isImporting && (
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4 }}
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
                  icon={esSuperadmin ? <AdminPanelSettingsIcon fontSize="small" /> : <BusinessIcon fontSize="small" />}
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
                    label={checkingAtlas ? 'Verificando Atlas...' : hasAtlasIntegration ? 'Atlas habilitado' : 'Atlas no habilitado'}
                    color={checkingAtlas ? 'default' : hasAtlasIntegration ? 'success' : 'default'}
                    variant={hasAtlasIntegration ? 'filled' : 'outlined'}
                    icon={checkingAtlas ? <CircularProgress size={14} /> : undefined}
                  />
                )}

                {isImporting && (
                  <Chip size="small" label={`Importando: ${importFileName || 'archivo'} (${progress}%)`} color="info" variant="outlined" />
                )}
              </Box>
            </Box>

            {/* Acciones principales */}
            {agenciaId && (
              <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={1} alignItems={{ xs: 'stretch', sm: 'center' }}>
                <Tooltip title="Actualizar lista de paquetes">
                  <IconButton
                    onClick={handleRefreshPaquetes}
                    disabled={isRefreshingPaquetes}
                    sx={{ borderRadius: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}
                  >
                    {isRefreshingPaquetes ? <CircularProgress size={20} /> : <RefreshIcon />}
                  </IconButton>
                </Tooltip>

                {/* ✅ NUEVO BOTÓN: CREAR PAQUETE */}
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleCrearPaquete}
                  disabled={isImporting || isSyncingAtlas}
                  sx={{
                    borderRadius: 999,
                    textTransform: 'none',
                    fontWeight: 700,
                    px: 2.5,
                    py: 1,
                    minWidth: 210,
                  }}
                >
                  Agregar paquete propio
                </Button>

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
                      borderColor: 'success.main',
                      color: 'success.main',
                      '&:hover': {
                        borderColor: 'success.dark',
                        bgcolor: 'success.light',
                      },
                    }}
                  >
                    {isSyncingAtlas ? 'Sincronizando...' : 'Sincronizar Atlas'}
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
                    px: 3,
                    py: 1.2,
                    minWidth: 180,
                  }}
                >
                  Exportar Excel
                </Button>
              </Box>
            )}
          </Box>
        </Paper>

        {/* INPUT oculto */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImportExcel}
          accept=".xlsx,.xls,.csv"
          style={{ display: 'none' }}
        />

        {/* CONTENIDO */}
        <Paper elevation={1} sx={{ p: 3, borderRadius: 3, position: 'relative' }}>
          <Stack spacing={3}>
            {esSuperadmin && (
              <>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Typography variant="h6" fontWeight={600}>
                    Resumen por agencia
                  </Typography>
                  <Chip label={`${agencias.length} agencias`} size="small" color="primary" variant="outlined" />
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
                    {isRefreshingPaquetes && <CircularProgress size={20} />}
                  </Box>

                  <Box display="flex" gap={1}>
                    <Chip
                      icon={<VisibilityIcon />}
                      label="Vista previa"
                      size="small"
                      variant="outlined"
                      onClick={() => addNotification('info', 'Vista previa activada')}
                    />
                    <Chip icon={<PlaylistAddCheckIcon />} label="Filtrar activos" size="small" color="primary" variant="outlined" />
                  </Box>
                </Box>

                <VistaPaquetesPaginados
                  agenciaId={String(agenciaId)}
                  onEditarPaquete={async (p: PaqueteListado) => {
                    try {
                      if (!p.id) return;

                      setIdAgenciaEnCreacion?.(String(agenciaId));
                      const full = await fetchPaqueteFull(p.id);

                      setPaqueteADuplicar?.(null);
                      setPaqueteSeleccionado?.(full);
                      abrirModal?.();
                    } catch (e) {
                      console.error(e);
                      addNotification('error', 'No se pudo cargar el paquete para editar');
                    }
                  }}
                  onDuplicarPaquete={async (p: PaqueteListado) => {
                    try {
                      if (!p.id) return;

                      setIdAgenciaEnCreacion?.(String(agenciaId));
                      const full = await fetchPaqueteFull(p.id);

                      setPaqueteSeleccionado?.(null);
                      setPaqueteADuplicar?.(full);
                      abrirModal?.();
                    } catch (e) {
                      console.error(e);
                      addNotification('error', 'No se pudo cargar el paquete para duplicar');
                    }
                  }}
                  onGestionarSalidas={async (p: PaqueteListado) => {
                    try {
                      if (!p.id) return;

                      setIdAgenciaEnCreacion?.(String(agenciaId));
                      const full = await fetchPaqueteFull(p.id);

                      setPaqueteActivoParaSalidas?.(full);
                    } catch (e) {
                      console.error(e);
                      addNotification('error', 'No se pudo cargar el paquete para ver salidas');
                    }
                  }}
                />
              </Box>
            )}

            {!esSuperadmin && !esAdminConAgencia && (
              <Alert severity="info" icon={<InfoIcon />} sx={{ borderRadius: 2 }}>
                <Typography variant="body2">
                  Tu rol actual no tiene una agencia asociada para administrar paquetes propios.
                  Contactá a un administrador para asignarte una agencia.
                </Typography>
              </Alert>
            )}
          </Stack>
        </Paper>

        {/* Stats import */}
        <Dialog open={openStatsDialog} onClose={handleCloseStatsDialog} maxWidth="sm" fullWidth>
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
              </Grid>
            )}
          </DialogContent>

          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseStatsDialog}>Cerrar</Button>
            <Button variant="contained" startIcon={<RefreshIcon />} onClick={() => {
              handleCloseStatsDialog();
              handleRefreshPaquetes();
            }}>
              Actualizar lista
            </Button>
          </DialogActions>
        </Dialog>

        {/* ✅ MODALES REALES */}
        <ModalPaquetePropio />
        <ModalSalidas />

        {/* Footer */}
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
