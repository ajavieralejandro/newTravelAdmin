'use client';

import * as React from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  LinearProgress,
  Button,
  Stack,
  Typography,
  Chip,
  TablePagination,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Grid,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

type AtlasItem = {
  OportunidadNumero?: string;
  OportunidadAsunto?: string;
  ContactoNombre?: string;
  ContactoEmail?: string;
  ContactoTelefono?: string;
  EstadoCodigo?: string;
  EstadoNombre?: string;
  OportunidadFechaCreacion?: string;
  OportunidadFechaRecibido?: string;
  OportunidadFechaVencimiento?: string;
  OportunidadDescripcion?: string;
  OportunidadMonto?: string;
  OportunidadMoneda?: string;
  ProductoCodigo?: string;
  ProductoNombre?: string;
  ProductoCategoria?: string;
  VendedorNombre?: string;
  VendedorEmail?: string;
  AgenciaNombre?: string;
  Prioridad?: string;
  Etapa?: string;
  Probabilidad?: string;
  Observaciones?: string;
  [key: string]: any; // Para otros campos que puedan venir
};

type Opportunity = {
  id: string;
  asunto: string;
  contacto: string;
  estado: string;      // viene de EstadoCodigo / EstadoNombre
  creado_en: string;   // ISO o ''
  rawData: AtlasItem;  // Guardamos los datos completos para el modal
};

type ApiResp = {
  ok: boolean;
  count: number;
  items: AtlasItem[];
};

function mapAtlasToRow(it: AtlasItem): Opportunity {
  const creado =
    it.OportunidadFechaCreacion ||
    it.OportunidadFechaRecibido ||
    '';

  return {
    id: it.OportunidadNumero ? `OP-${it.OportunidadNumero}` : '-',
    asunto: it.OportunidadAsunto || '(Sin asunto)',
    contacto: it.ContactoNombre || '(Sin contacto)',
    estado: it.EstadoNombre || it.EstadoCodigo || '',
    creado_en: creado,
    rawData: it, // Guardamos todos los datos originales
  };
}

function parseFecha(raw: string | undefined | null): number {
  if (!raw || raw === '0000-00-00T00:00:00') return 0;
  const t = Date.parse(raw);
  return Number.isNaN(t) ? 0 : t;
}

function colorForEstado(estado: string): 'default' | 'success' | 'warning' | 'info' | 'error' {
  const e = estado.toLowerCase();

  if (e.includes('ganada') || e.includes('confirmada') || e.includes('cerrada')) {
    return 'success';
  }
  if (e.includes('perdida') || e.includes('cancelada')) {
    return 'error';
  }
  if (e.includes('en curso') || e.includes('abierta')) {
    return 'info';
  }
  if (e.includes('pending') || e.includes('pendiente')) {
    return 'warning';
  }
  return 'default';
}

function formatDate(dateString?: string): string {
  if (!dateString || dateString === '0000-00-00T00:00:00') return 'No especificada';
  try {
    return new Date(dateString).toLocaleString('es-AR');
  } catch {
    return dateString;
  }
}

function formatCurrency(monto?: string, moneda?: string): string {
  if (!monto) return 'No especificado';
  
  const amount = parseFloat(monto);
  if (isNaN(amount)) return monto;
  
  const currency = moneda?.toUpperCase() || 'ARS';
  
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: currency === 'USD' ? 'USD' : 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Componente para mostrar un campo en el modal
interface DetailFieldProps {
  label: string;
  value?: string | number;
  isCurrency?: boolean;
  moneda?: string;
  isDate?: boolean;
  chip?: boolean;
}

function DetailField({ label, value, isCurrency, moneda, isDate, chip }: DetailFieldProps) {
  if (!value && value !== 0) return null;

  let displayValue = String(value);
  
  if (isCurrency) {
    displayValue = formatCurrency(String(value), moneda);
  } else if (isDate) {
    displayValue = formatDate(String(value));
  }

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="caption" color="text.secondary" display="block">
        {label}
      </Typography>
      {chip ? (
        <Chip
          size="small"
          label={displayValue}
          color={colorForEstado(displayValue)}
          sx={{ mt: 0.5 }}
        />
      ) : (
        <Typography variant="body2" sx={{ mt: 0.5 }}>
          {displayValue || '—'}
        </Typography>
      )}
    </Box>
  );
}

export function OpportunitiesTable({
  agenciaId,
  apiBase = 'https://travelconnect.com.ar',
}: {
  agenciaId: number | null;
  apiBase?: string;
}) {
  const [rows, setRows] = React.useState<Opportunity[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedOpportunity, setSelectedOpportunity] = React.useState<AtlasItem | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRpp] = React.useState(10);

  const load = React.useCallback(async () => {
    if (!agenciaId) {
      setRows([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = `${apiBase}/api/agencias/${agenciaId}/atlas/oportunidades?registros=100&pagina=1`;
      const r = await fetch(url, { headers: { Accept: 'application/json' } });
      if (!r.ok) throw new Error(`HTTP ${r.status} ${r.statusText}`);
      const json: ApiResp = await r.json();
      const items = Array.isArray(json?.items) ? json.items : [];

      const mapped = items.map(mapAtlasToRow);

      // 🔁 Ordenar por fecha DESC (más recientes primero)
      const ordered = mapped.sort(
        (a, b) => parseFecha(b.creado_en) - parseFecha(a.creado_en)
      );

      setRows(ordered);
      setPage(0);
    } catch (e: any) {
      setError(e?.message ?? 'Error al cargar oportunidades');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [agenciaId, apiBase]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const handleOpenModal = (opportunity: AtlasItem, event: React.MouseEvent) => {
    event.stopPropagation(); // Previene que se active el click de la fila
    setSelectedOpportunity(opportunity);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleRowClick = (opportunity: AtlasItem) => {
    // Opcional: puedes mantener el click en la fila también si quieres
    // setSelectedOpportunity(opportunity);
    // setModalOpen(true);
  };

  const pageRows = React.useMemo(() => {
    const start = page * rowsPerPage;
    return rows.slice(start, start + rowsPerPage);
  }, [rows, page, rowsPerPage]);

  return (
    <>
      <Card elevation={2}>
        <CardHeader
          title="Oportunidades"
          subheader={
            agenciaId
              ? `Agencia #${agenciaId}`
              : 'Seleccioná una agencia para ver las oportunidades'
          }
          action={
            <Stack direction="row" spacing={1}>
              <Button
                startIcon={<AddIcon />}
                variant="outlined"
                disabled
                sx={{ textTransform: 'none' }}
              >
                Nueva oportunidad
              </Button>
              <Button
                variant="text"
                onClick={() => void load()}
                disabled={loading}
                startIcon={<RefreshIcon />}
                sx={{ textTransform: 'none' }}
              >
                Refrescar
              </Button>
            </Stack>
          }
        />
        <Divider />
        <CardContent>
          {loading && <LinearProgress sx={{ mb: 2 }} />}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TableContainer sx={{ maxHeight: 480 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Asunto</TableCell>
                  <TableCell>Contacto</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Creado</TableCell>
                  <TableCell width="60">Detalles</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {!loading &&
                  pageRows.map((op) => (
                    <TableRow
                      key={`${op.id}-${op.creado_en}`}
                      hover
                      sx={{ cursor: 'default' }}
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {op.id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{op.asunto}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{op.contacto}</Typography>
                      </TableCell>
                      <TableCell>
                        {op.estado ? (
                          <Chip
                            size="small"
                            label={op.estado}
                            color={colorForEstado(op.estado)}
                            variant="outlined"
                          />
                        ) : (
                          <Typography variant="body2">—</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {op.creado_en &&
                        op.creado_en !== '0000-00-00T00:00:00' &&
                        parseFecha(op.creado_en) !== 0
                          ? new Date(op.creado_en).toLocaleString('es-AR')
                          : '—'}
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Ver detalles completos">
                          <IconButton
                            size="small"
                            onClick={(e) => handleOpenModal(op.rawData, e)}
                            sx={{
                              color: 'primary.main',
                              '&:hover': {
                                backgroundColor: 'primary.lighter',
                              }
                            }}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}

                {!loading && rows.length === 0 && !error && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                      <Stack spacing={1} alignItems="center">
                        <Typography variant="body2" sx={{ opacity: 0.7 }}>
                          Aún no hay oportunidades para mostrar.
                        </Typography>
                        <Button
                          startIcon={<AddIcon />}
                          variant="outlined"
                          disabled
                          sx={{ textTransform: 'none' }}
                        >
                          Crear oportunidad
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={rows.length}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRpp(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25, 50]}
            labelRowsPerPage="Filas por página"
            sx={{ mt: 1 }}
          />
        </CardContent>
      </Card>

      {/* Modal de detalles */}
      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
        scroll="paper"
      >
        <DialogTitle sx={{ pb: 1, pr: 6 }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography variant="h6" gutterBottom>
                Detalles de Oportunidad
              </Typography>
              <Typography variant="subtitle1" color="primary">
                {selectedOpportunity?.OportunidadAsunto || 'Sin asunto'}
              </Typography>
            </Box>
            <IconButton
              onClick={handleCloseModal}
              size="small"
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent dividers>
          {selectedOpportunity ? (
            <Grid container spacing={3}>
              {/* Primera fila: Información principal */}
              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2.5, backgroundColor: 'grey.50' }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}>
                      <DetailField
                        label="ID de Oportunidad"
                        value={selectedOpportunity.OportunidadNumero ? `OP-${selectedOpportunity.OportunidadNumero}` : undefined}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <DetailField
                        label="Estado"
                        value={selectedOpportunity.EstadoNombre || selectedOpportunity.EstadoCodigo}
                        chip
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <DetailField
                        label="Prioridad"
                        value={selectedOpportunity.Prioridad}
                        chip
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <DetailField
                        label="Monto"
                        value={selectedOpportunity.OportunidadMonto}
                        isCurrency
                        moneda={selectedOpportunity.OportunidadMoneda}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {/* Segunda fila: Dos columnas principales */}
              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 2.5, height: '100%' }}>
                  <Typography variant="subtitle2" gutterBottom color="primary" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <InfoOutlinedIcon fontSize="small" />
                    Información de Contacto
                  </Typography>
                  
                  <DetailField
                    label="Nombre"
                    value={selectedOpportunity.ContactoNombre}
                  />
                  
                  <DetailField
                    label="Email"
                    value={selectedOpportunity.ContactoEmail}
                  />
                  
                  <DetailField
                    label="Teléfono"
                    value={selectedOpportunity.ContactoTelefono}
                  />
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 2.5, height: '100%' }}>
                  <Typography variant="subtitle2" gutterBottom color="primary" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <InfoOutlinedIcon fontSize="small" />
                    Información de Producto
                  </Typography>
                  
                  <DetailField
                    label="Producto"
                    value={selectedOpportunity.ProductoNombre}
                  />
                  
                  <DetailField
                    label="Categoría"
                    value={selectedOpportunity.ProductoCategoria}
                  />
                  
                  <DetailField
                    label="Código"
                    value={selectedOpportunity.ProductoCodigo}
                  />
                  
                  <DetailField
                    label="Vendedor"
                    value={selectedOpportunity.VendedorNombre}
                  />
                </Paper>
              </Grid>

              {/* Tercera fila: Fechas */}
              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2.5 }}>
                  <Typography variant="subtitle2" gutterBottom color="primary" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <InfoOutlinedIcon fontSize="small" />
                    Fechas Relevantes
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={4}>
                      <DetailField
                        label="Fecha de Creación"
                        value={selectedOpportunity.OportunidadFechaCreacion}
                        isDate
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <DetailField
                        label="Fecha de Recepción"
                        value={selectedOpportunity.OportunidadFechaRecibido}
                        isDate
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <DetailField
                        label="Fecha de Vencimiento"
                        value={selectedOpportunity.OportunidadFechaVencimiento}
                        isDate
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {/* Campos de texto largos */}
              {selectedOpportunity.OportunidadDescripcion && (
                <Grid item xs={12}>
                  <Paper variant="outlined" sx={{ p: 2.5 }}>
                    <Typography variant="subtitle2" gutterBottom color="primary">
                      Descripción
                    </Typography>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                      {selectedOpportunity.OportunidadDescripcion}
                    </Typography>
                  </Paper>
                </Grid>
              )}
              
              {selectedOpportunity.Observaciones && (
                <Grid item xs={12}>
                  <Paper variant="outlined" sx={{ p: 2.5 }}>
                    <Typography variant="subtitle2" gutterBottom color="primary">
                      Observaciones
                    </Typography>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                      {selectedOpportunity.Observaciones}
                    </Typography>
                  </Paper>
                </Grid>
              )}

              {/* Campos adicionales */}
              {(() => {
                const knownFields = [
                  'OportunidadNumero', 'OportunidadAsunto', 'ContactoNombre',
                  'EstadoCodigo', 'EstadoNombre', 'OportunidadFechaCreacion',
                  'OportunidadFechaRecibido', 'OportunidadFechaVencimiento',
                  'OportunidadDescripcion', 'OportunidadMonto', 'OportunidadMoneda',
                  'ProductoCodigo', 'ProductoNombre', 'ProductoCategoria',
                  'VendedorNombre', 'VendedorEmail', 'AgenciaNombre',
                  'Prioridad', 'Etapa', 'Probabilidad', 'Observaciones',
                  'ContactoEmail', 'ContactoTelefono'
                ];
                
                const additionalFields = Object.entries(selectedOpportunity)
                  .filter(([key, value]) => !knownFields.includes(key) && value && typeof value === 'string' && value.trim() !== '')
                  .slice(0, 6); // Limitar a 6 campos adicionales

                if (additionalFields.length === 0) return null;

                return (
                  <Grid item xs={12}>
                    <Paper variant="outlined" sx={{ p: 2.5 }}>
                      <Typography variant="subtitle2" gutterBottom color="primary">
                        Información Adicional
                      </Typography>
                      <Grid container spacing={3}>
                        {additionalFields.map(([key, value]) => (
                          <Grid item xs={12} sm={6} md={4} key={key}>
                            <DetailField
                              label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                              value={value as string}
                            />
                          </Grid>
                        ))}
                      </Grid>
                    </Paper>
                  </Grid>
                );
              })()}
            </Grid>
          ) : (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">
                No se encontraron datos para mostrar
              </Typography>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button 
            onClick={handleCloseModal} 
            variant="contained"
            sx={{ textTransform: 'none', minWidth: 100 }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}