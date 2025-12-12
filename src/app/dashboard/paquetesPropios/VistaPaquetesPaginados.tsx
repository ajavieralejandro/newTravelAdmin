'use client';

import {
  useState,
  useEffect,
  useCallback,
} from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Tooltip,
  Chip,
  Typography,
  TextField,
  InputAdornment,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SyncIcon from '@mui/icons-material/Sync';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import DeleteIcon from '@mui/icons-material/Delete';

// Base ABSOLUTA al backend (igual que en la página)
const RAW_BASE = (process.env.NEXT_PUBLIC_API_BASE ?? '').trim();
const API_BASE =
  RAW_BASE !== '' ? RAW_BASE.replace(/\/+$/, '') : 'https://travelconnect.com.ar';

const apiUrl = (path: string) =>
  `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;

// Tipo de un paquete unificado (lo que devuelve /paquetes-paginados)
type Salida = {
  id: number | null;
  fecha_viaje?: string | null;
  fecha_desde?: string | null;
  fecha_hasta?: string | null;
  doble_precio?: number | null;
  tipo_transporte?: string | null;
};

export type PaqueteListado = {
  id: number | string | null;
  titulo: string;
  descripcion?: string | null;
  ciudad?: string | null;
  cant_noches?: number | null;
  tipo_moneda?: string | null;
  usuario?: string | null;          // Atlas / AllSeasons / Agencia
  usuario_id?: number | null;
  external_source?: string | null;  // 'atlas' | 'manual' | 'allseasons' etc
  is_remote?: boolean;
  salidas?: Salida[];
};

type PaginationBackend = {
  current_page: number;
  per_page: number;
  from: number | null;
  to: number | null;
  total: number;
  last_page: number;
};

interface VistaPaquetesPaginadosProps {
  agenciaId: string;

  // Callbacks opcionales para acciones por paquete
  onVerPaquete?: (paquete: PaqueteListado) => void;
  onEditarPaquete?: (paquete: PaqueteListado) => void;
  onDuplicarPaquete?: (paquete: PaqueteListado) => void;
  onGestionarSalidas?: (paquete: PaqueteListado) => void;
  onEliminarPaquete?: (paquete: PaqueteListado) => void;
}

export default function VistaPaquetesPaginados({
  agenciaId,
  onVerPaquete,
  onEditarPaquete,
  onDuplicarPaquete,
  onGestionarSalidas,
  onEliminarPaquete,
}: VistaPaquetesPaginadosProps) {
  const [paquetes, setPaquetes] = useState<PaqueteListado[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // pag es 0-based para MUI, backend usa 1-based
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [pagination, setPagination] = useState<PaginationBackend>({
    current_page: 1,
    per_page: 10,
    from: 0,
    to: 0,
    total: 0,
    last_page: 1,
  });

  const [searchTerm, setSearchTerm] = useState('');

  const fetchPaquetes = useCallback(async () => {
    if (!agenciaId) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        id: agenciaId, // 👈 el backend espera "id" de agencia
        page: (page + 1).toString(),
        per_page: rowsPerPage.toString(),
      });

      // Buscar por título
      if (searchTerm.trim() !== '') {
        params.append('filtro_titulo', searchTerm.trim());
      }

      const url = apiUrl(`/paquetes-paginados?${params.toString()}`);
      console.log('🔎 GET', url);

      const resp = await fetch(url, {
        credentials: 'include',
        headers: {
          Accept: 'application/json',
        },
      });

      if (!resp.ok) {
        throw new Error(`Error ${resp.status}: ${resp.statusText}`);
      }

      const json = await resp.json();
      console.log('✅ Respuesta /paquetes-paginados', json);

      if (!json || !Array.isArray(json.data) || !json.pagination) {
        throw new Error('Formato de respuesta inválido');
      }

      setPaquetes(json.data as PaqueteListado[]);
      setPagination(json.pagination as PaginationBackend);
    } catch (e) {
      console.error('❌ Error cargando paquetes paginados', e);
      setError(e instanceof Error ? e.message : 'Error desconocido');
      setPaquetes([]);
    } finally {
      setLoading(false);
    }
  }, [agenciaId, page, rowsPerPage, searchTerm]);

  useEffect(() => {
    fetchPaquetes();
  }, [fetchPaquetes]);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleSearchSubmit = () => {
    // simplemente vuelve a llamar al fetch con el nuevo searchTerm
    fetchPaquetes();
  };

  const getPrecioDestacado = (p: PaqueteListado): number | null => {
    if (!p.salidas || p.salidas.length === 0) return null;
    const primera = p.salidas[0];
    return primera?.doble_precio ?? null;
  };

  const getMoneda = (p: PaqueteListado): string => {
    const m = (p.tipo_moneda ?? '').toUpperCase();
    if (m === 'USD') return 'US$';
    if (m === 'EUR') return '€';
    if (m === 'ARS') return '$';
    return m || '$';
  };

  // --- ACCIONES ---

  // Duplicar paquete:
  // - si el padre define onDuplicarPaquete -> se usa eso
  // - si no, se hace GET /get_paquete2/{id} y luego POST /create_paquete2/{agenciaId}
  const handleDuplicar = async (p: PaqueteListado) => {
    if (onDuplicarPaquete) {
      onDuplicarPaquete(p);
      return;
    }

    if (!p.id || !agenciaId) return;

    try {
      setLoading(true);
      setError(null);

      // 1) Traer paquete completo
      const getUrl = apiUrl(`/get_paquete2/${p.id}`);
      console.log('📄 GET paquete para duplicar', getUrl);

      const getResp = await fetch(getUrl, {
        credentials: 'include',
        headers: {
          Accept: 'application/json',
        },
      });

      if (!getResp.ok) {
        throw new Error(`Error al obtener paquete (${getResp.status})`);
      }

      const paqueteCompleto = await getResp.json();

      // 2) Ajustar datos para la copia
      // (esto depende de cómo venga la estructura, pero en general:
      // - limpiar id
      // - cambiar título
      const payload: any = {
        ...paqueteCompleto,
        id: null,
        titulo: `${paqueteCompleto.titulo ?? p.titulo} (copia)`,
      };

      // 3) Crear nuevo paquete para esta agencia
      const postUrl = apiUrl(`/create_paquete2/${agenciaId}`);
      console.log('📄 POST duplicar paquete', postUrl, payload);

      const postResp = await fetch(postUrl, {
        method: 'POST',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!postResp.ok) {
        throw new Error(`Error al duplicar paquete (${postResp.status})`);
      }

      // Refrescar lista
      await fetchPaquetes();
    } catch (e) {
      console.error('❌ Error duplicando paquete', e);
      setError(
        e instanceof Error
          ? e.message
          : 'Error desconocido al duplicar el paquete'
      );
    } finally {
      setLoading(false);
    }
  };

  // Eliminar paquete:
  // - si hay onEliminarPaquete -> se usa
  // - si no, DELETE /delete_paquete/{id}
  const handleEliminar = async (p: PaqueteListado) => {
    if (onEliminarPaquete) {
      onEliminarPaquete(p);
      return;
    }

    if (!p.id) return;

    const confirmado = window.confirm(
      `¿Seguro que querés eliminar el paquete "${p.titulo}"?`
    );
    if (!confirmado) return;

    try {
      setLoading(true);
      setError(null);

      const url = apiUrl(`/delete_paquete/${p.id}`);
      console.log('🗑 DELETE', url);

      const resp = await fetch(url, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
        },
      });

      if (!resp.ok) {
        throw new Error(`Error al eliminar paquete (${resp.status})`);
      }

      await fetchPaquetes();
    } catch (e) {
      console.error('❌ Error eliminando paquete', e);
      setError(
        e instanceof Error
          ? e.message
          : 'Error desconocido al eliminar el paquete'
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading && paquetes.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Error arriba, pero sin bloquear todo si ya hay data */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Barra de búsqueda y refresco */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 2,
          bgcolor: 'background.default',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
          <TextField
            placeholder="Buscar paquetes por título..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 250, flexGrow: 1 }}
          />

          <Button
            variant="contained"
            onClick={handleSearchSubmit}
            disabled={loading}
            sx={{ borderRadius: 2 }}
          >
            Buscar
          </Button>

          <Tooltip title="Actualizar lista">
            <IconButton onClick={fetchPaquetes} disabled={loading}>
              {loading ? <CircularProgress size={20} /> : <SyncIcon />}
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>

      {/* Tabla de resultados */}
      <TableContainer component={Paper} elevation={0} variant="outlined">
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'action.hover' }}>
              <TableCell width="260">
                <Typography variant="subtitle2" fontWeight={600}>
                  Nombre
                </Typography>
              </TableCell>
              <TableCell width="160">
                <Typography variant="subtitle2" fontWeight={600}>
                  Ciudad / Destino
                </Typography>
              </TableCell>
              <TableCell width="90" align="center">
                <Typography variant="subtitle2" fontWeight={600}>
                  Noches
                </Typography>
              </TableCell>
              <TableCell width="140" align="right">
                <Typography variant="subtitle2" fontWeight={600}>
                  Precio desde
                </Typography>
              </TableCell>
              <TableCell width="120" align="center">
                <Typography variant="subtitle2" fontWeight={600}>
                  Origen
                </Typography>
              </TableCell>
              <TableCell width="200" align="center">
                <Typography variant="subtitle2" fontWeight={600}>
                  Acciones
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paquetes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    No se encontraron paquetes
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paquetes.map((p) => {
                const precio = getPrecioDestacado(p);
                const origen =
                  p.external_source ?? (p.is_remote ? 'remoto' : 'manual');

                return (
                  <TableRow
                    key={String(p.id ?? Math.random())}
                    hover
                    sx={{
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                  >
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {p.titulo}
                        </Typography>
                        {p.descripcion && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            noWrap
                          >
                            {p.descripcion.substring(0, 70)}...
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {p.ciudad ? (
                        <Chip
                          label={p.ciudad}
                          size="small"
                          variant="outlined"
                        />
                      ) : (
                        <Typography variant="caption" color="text.disabled">
                          Sin ciudad
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {p.cant_noches ? (
                        <Chip
                          label={`${p.cant_noches} noches`}
                          size="small"
                        />
                      ) : (
                        <Typography variant="caption" color="text.disabled">
                          -
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      {precio != null ? (
                        <Typography variant="body2" fontWeight={600}>
                          {getMoneda(p)} {precio.toLocaleString('es-AR')}
                        </Typography>
                      ) : (
                        <Typography variant="caption" color="text.disabled">
                          Consultar
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={origen}
                        size="small"
                        variant="outlined"
                        color={
                          origen === 'atlas'
                            ? 'primary'
                            : origen === 'allseasons'
                            ? 'secondary'
                            : 'default'
                        }
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box display="flex" justifyContent="center" gap={0.5}>
                        {/* Ver detalles */}
                        <Tooltip title="Ver detalles">
                          <IconButton
                            size="small"
                            color="info"
                            onClick={() => onVerPaquete?.(p)}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        {/* Editar paquete (el padre maneja el formulario y POST /paquetes/{id}/update) */}
                        <Tooltip title="Editar paquete">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => onEditarPaquete?.(p)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        {/* Duplicar paquete */}
                        <Tooltip title="Duplicar paquete">
                          <IconButton
                            size="small"
                            onClick={() => handleDuplicar(p)}
                          >
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        {/* Gestionar salidas */}
                        <Tooltip title="Ver / editar salidas">
                          <IconButton
                            size="small"
                            color="secondary"
                            onClick={() => onGestionarSalidas?.(p)}
                          >
                            <EventSeatIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        {/* Eliminar paquete */}
                        <Tooltip title="Eliminar paquete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleEliminar(p)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Paginación */}
      {paquetes.length > 0 && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={pagination.total}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
          }
        />
      )}

      {/* Resumen */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mt={2}
      >
        <Typography variant="caption" color="text.secondary">
          Mostrando {paquetes.length} de {pagination.total} paquetes
        </Typography>

        <Chip
          label={`${pagination.current_page}/${pagination.last_page}`}
          size="small"
          variant="outlined"
        />
      </Box>
    </Box>
  );
}
