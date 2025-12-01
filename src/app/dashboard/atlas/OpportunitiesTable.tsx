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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';

type Opportunity = {
  id: string;
  asunto: string;
  contacto: string;
  estado: string;      // viene de EstadoCodigo / EstadoNombre
  creado_en: string;   // ISO o ''
};

type AtlasItem = {
  OportunidadNumero?: string;
  OportunidadAsunto?: string;
  ContactoNombre?: string;
  EstadoCodigo?: string;
  EstadoNombre?: string;
  OportunidadFechaCreacion?: string;
  OportunidadFechaRecibido?: string;
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

  const pageRows = React.useMemo(() => {
    const start = page * rowsPerPage;
    return rows.slice(start, start + rowsPerPage);
  }, [rows, page, rowsPerPage]);

  return (
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
                  </TableRow>
                ))}

              {!loading && rows.length === 0 && !error && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
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
  );
}
