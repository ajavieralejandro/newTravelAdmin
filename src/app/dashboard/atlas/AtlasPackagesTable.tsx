'use client';
/* eslint-disable no-console */

import * as React from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  Divider,
  TextField,
  InputAdornment,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  TablePagination,
  LinearProgress,
  Stack,
  Chip,
  Alert,
  Typography,
  Box,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';

type AtlasFlags = {
  aereo?: boolean;
  terrestre?: boolean;
  maritimo?: boolean;
  hotel?: boolean;
  traslado?: boolean;
  paseo?: boolean;
  auto?: boolean;
  seguro?: boolean;
};

type AtlasItem = {
  externo_codigo: string;
  titulo: string;
  tipo_codigo?: string | null;
  tipo_nombre?: string | null;
  descripcion?: string | null;
  precio_destacado?: number | null;
  moneda?: string | null;
  viaje_desde?: string | null;
  viaje_hasta?: string | null;
  vigencia_desde?: string | null;
  vigencia_hasta?: string | null;
  foto?: string | null;
  flags?: AtlasFlags;
  tiene_precio?: boolean;
  tiene_fechas_viaje?: boolean;
  tiene_fechas_vigencia?: boolean;
  tiene_imagen?: boolean;
};

type AtlasStats = {
  total_paquetes: number;
  sin_precio: number;
  sin_fechas_viaje: number;
  sin_fechas_vigencia: number;
  sin_imagen: number;
};

type AtlasResponse = {
  ok: boolean;
  cant: number;
  items: AtlasItem[];
  agencia?: string;
  endpoint?: string;
  tiempo_ms?: number;
  payload_enviado?: unknown;
  estadisticas?: AtlasStats;
};

const DEBUG = true;
const log = (...a: any[]) => {
  if (DEBUG) console.debug('[AtlasPackagesTable]', ...a);
};

function toNumber(x: unknown): number | null {
  if (x == null) return null;
  if (typeof x === 'number') return Number.isFinite(x) ? x : null;
  const n = parseInt(String(x).trim(), 10);
  return Number.isFinite(n) ? n : null;
}

async function fetchPaquetes(
  agenciaId: number,
  signal?: AbortSignal
): Promise<AtlasResponse> {
  const base =
    process.env.NEXT_PUBLIC_API_BASE ?? 'https://travelconnect.com.ar/api';
  const url = `${base}/atlas/agencias/${agenciaId}/importar-paquetes`;

  log('fetch →', { url, method: 'POST' });

  const t0 = performance.now();
  const res = await fetch(url, {
    method: 'POST', // si tu endpoint es GET, cambiá a 'GET' y quitá body
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}), // si no requiere body, podés quitarlo
    signal,
    cache: 'no-store',
  });

  const dt = Math.round(performance.now() - t0);
  log('fetch status:', res.status, res.statusText, `(${dt} ms)`);

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${res.statusText} :: ${text}`);
  }

  const json = await res.json();
  log('fetch json keys:', Object.keys(json ?? {}));

  const items: AtlasItem[] = Array.isArray(json?.items)
    ? (json.items as AtlasItem[])
    : [];

  return {
    ok: Boolean(json?.ok),
    cant: Number(json?.cant ?? items.length),
    items,
    agencia: typeof json?.agencia === 'string' ? json.agencia : undefined,
    endpoint: typeof json?.endpoint === 'string' ? json.endpoint : undefined,
    tiempo_ms:
      typeof json?.tiempo_ms === 'number' ? json.tiempo_ms : undefined,
    payload_enviado: json?.payload_enviado,
    estadisticas: json?.estadisticas as AtlasStats | undefined,
  };
}

export function AtlasPackagesTable({
  idAgencia,
}: {
  idAgencia: number | string | undefined;
}) {
  const agenciaNumericId = React.useMemo(() => {
    const n = toNumber(idAgencia);
    log('memo agenciaNumericId ←', { raw: idAgencia, parsed: n, valid: n !== null });
    return n;
  }, [idAgencia]);

  const [rows, setRows] = React.useState<AtlasItem[]>([]);
  const [meta, setMeta] = React.useState<{
    ok?: boolean;
    cant?: number;
    agencia?: string;
    tiempo_ms?: number;
    estadisticas?: AtlasStats;
  }>({});
  const [loading, setLoading] = React.useState(false);
  const [q, setQ] = React.useState('');
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRpp] = React.useState(10);
  const [error, setError] = React.useState<string | null>(null);

  const abortRef = React.useRef<AbortController | null>(null);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = () => {
    abortRef.current?.abort();
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
  };

  const load = React.useCallback(async () => {
    if (!agenciaNumericId) {
      log('load() cancelado: agenciaNumericId inválido', agenciaNumericId);
      return;
    }
    log('load() start →', { agenciaNumericId });

    clearTimers();

    const ctrl = new AbortController();
    abortRef.current = ctrl;
    timeoutRef.current = setTimeout(() => {
      log('timeout 15s → aborting fetch');
      ctrl.abort();
    }, 15000);

    setLoading(true);
    setError(null);

    try {
      const data = await fetchPaquetes(agenciaNumericId, ctrl.signal);
      log('load() OK → items:', data.items?.length, 'meta:', {
        ok: data.ok,
        cant: data.cant,
        agencia: data.agencia,
        tiempo_ms: data.tiempo_ms,
        stats: data.estadisticas,
      });

      // Ordenar por código externo o título
      const ordered = [...(data.items ?? [])].sort((a, b) => {
        const ca = a.externo_codigo ?? '';
        const cb = b.externo_codigo ?? '';
        return ca.localeCompare(cb);
      });

      setRows(ordered);
      setMeta({
        ok: data.ok,
        cant: data.cant,
        agencia: data.agencia,
        tiempo_ms: data.tiempo_ms,
        estadisticas: data.estadisticas,
      });
      setPage(0);
    } catch (e: any) {
      if (e?.name === 'AbortError') {
        log('load() ABORTED');
      } else {
        log('load() ERROR →', e);
      }
      setRows([]);
      setMeta({});
      setError(e?.message ?? 'Error al cargar');
    } finally {
      setLoading(false);
      clearTimers();
      log('load() end');
    }
  }, [agenciaNumericId]);

  React.useEffect(() => {
    log('mounted. idAgencia prop =', idAgencia);
    return () => {
      log('unmount → abort pending fetch (if any)');
      clearTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    log('effect id change →', { agenciaNumericId });
    if (agenciaNumericId) {
      void load();
    } else {
      setRows([]);
      setMeta({});
    }
  }, [agenciaNumericId, load]);

  React.useEffect(() => {
    log('rows changed →', rows.length);
  }, [rows]);
  React.useEffect(() => {
    log('search query changed →', q);
  }, [q]);
  React.useEffect(() => {
    log('pagination changed →', { page, rowsPerPage });
  }, [page, rowsPerPage]);

  const filtered = React.useMemo(() => {
    if (!q) return rows;
    const needle = q.toLowerCase();
    return rows.filter((p) => {
      const titulo = (p.titulo ?? '').toLowerCase();
      const externo = (p.externo_codigo ?? '').toLowerCase();
      const desc = (p.descripcion ?? '').toLowerCase();
      const tipo = (p.tipo_nombre ?? '').toLowerCase();
      return (
        titulo.includes(needle) ||
        externo.includes(needle) ||
        desc.includes(needle) ||
        tipo.includes(needle)
      );
    });
  }, [rows, q]);

  const pageRows = React.useMemo(() => {
    const start = page * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, page, rowsPerPage]);

  const sub = agenciaNumericId
    ? meta.agencia
      ? `Agencia #${agenciaNumericId} · ${meta.agencia}`
      : `(Agencia #${agenciaNumericId})`
    : 'Ingresá/seleccioná un ID de agencia válido';

  return (
    <Card elevation={2}>
      <CardHeader
        title={
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="h6">
              Productos Atlas (vista previa sin persistir)
            </Typography>
            {meta.ok && (
              <Chip
                size="small"
                variant="outlined"
                label="Atlas API · WSProductoBuscar"
                sx={{ fontSize: 10 }}
              />
            )}
          </Stack>
        }
        subheader={sub}
        action={
          <IconButton
            onClick={() => {
              log('click recargar');
              void load();
            }}
            aria-label="recargar"
          >
            <RefreshIcon />
          </IconButton>
        }
      />
      <Divider />
      <CardContent>
        {!agenciaNumericId && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Ingresá/seleccioná un <strong>ID de agencia</strong> válido para
            iniciar la consulta.
          </Alert>
        )}

        <Stack
          direction="row"
          spacing={1}
          sx={{ mb: 1 }}
          alignItems="center"
          flexWrap="wrap"
        >
          {typeof meta.ok === 'boolean' && (
            <Chip
              size="small"
              label={meta.ok ? 'OK' : 'ERROR'}
              color={meta.ok ? 'success' : 'error'}
            />
          )}
          {typeof meta.cant === 'number' && (
            <Chip size="small" label={`Items totales (API): ${meta.cant}`} />
          )}
          <Chip size="small" label={`Filas en tabla: ${rows.length}`} />
          {typeof meta.tiempo_ms === 'number' && (
            <Chip size="small" label={`Tiempo: ${meta.tiempo_ms} ms`} />
          )}
          {meta.estadisticas && (
            <>
              <Chip
                size="small"
                label={`Sin precio: ${meta.estadisticas.sin_precio}`}
              />
              <Chip
                size="small"
                label={`Sin fechas viaje: ${meta.estadisticas.sin_fechas_viaje}`}
              />
              <Chip
                size="small"
                label={`Sin imagen: ${meta.estadisticas.sin_imagen}`}
              />
            </>
          )}
          <Chip size="small" label={loading ? 'Cargando…' : 'Listo'} />
        </Stack>

        <TextField
          fullWidth
          placeholder="Buscar por título, código, descripción o tipo…"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(0);
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />

        {loading && <LinearProgress sx={{ mb: 2 }} />}
        {error && !loading && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TableContainer sx={{ maxHeight: 480 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Código</TableCell>
                <TableCell>Título</TableCell>
                <TableCell>Fechas viaje</TableCell>
                <TableCell>Precio</TableCell>
                <TableCell>Moneda</TableCell>
                <TableCell align="center">Componentes</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pageRows.map((p) => (
                <TableRow key={p.externo_codigo} hover sx={{ cursor: 'default' }}>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {p.externo_codigo}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Stack spacing={0.5}>
                      <Typography variant="body2" fontWeight={600}>
                        {p.titulo ?? '—'}
                      </Typography>
                      {p.tipo_nombre && (
                        <Typography
                          variant="caption"
                          sx={{ opacity: 0.7 }}
                        >{`${p.tipo_nombre}`}</Typography>
                      )}
                      {p.descripcion && (
                        <Typography
                          variant="caption"
                          sx={{ opacity: 0.7 }}
                          noWrap
                        >
                          {p.descripcion}
                        </Typography>
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {p.viaje_desde || p.viaje_hasta
                        ? `${p.viaje_desde ?? '¿?'} → ${p.viaje_hasta ?? '¿?'}`
                        : '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {p.precio_destacado != null
                        ? p.precio_destacado.toLocaleString('es-AR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })
                        : '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {p.moneda && p.moneda !== '' ? p.moneda : '—'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    {p.flags ? (
                      <Stack direction="row" spacing={0.5} flexWrap="wrap">
                        {p.flags.aereo && (
                          <Chip size="small" label="Aéreo" variant="outlined" />
                        )}
                        {p.flags.terrestre && (
                          <Chip
                            size="small"
                            label="Terrestre"
                            variant="outlined"
                          />
                        )}
                        {p.flags.hotel && (
                          <Chip size="small" label="Hotel" variant="outlined" />
                        )}
                        {p.flags.traslado && (
                          <Chip
                            size="small"
                            label="Traslados"
                            variant="outlined"
                          />
                        )}
                        {p.flags.paseo && (
                          <Chip size="small" label="Paseos" variant="outlined" />
                        )}
                        {p.flags.auto && (
                          <Chip size="small" label="Auto" variant="outlined" />
                        )}
                        {p.flags.seguro && (
                          <Chip size="small" label="Seguro" variant="outlined" />
                        )}
                        {!p.flags.aereo &&
                          !p.flags.terrestre &&
                          !p.flags.hotel &&
                          !p.flags.traslado &&
                          !p.flags.paseo &&
                          !p.flags.auto &&
                          !p.flags.seguro && (
                            <Typography variant="caption" sx={{ opacity: 0.6 }}>
                              Sin componentes marcados
                            </Typography>
                          )}
                      </Stack>
                    ) : (
                      <Typography variant="caption" sx={{ opacity: 0.6 }}>
                        Sin datos
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}

              {!loading && pageRows.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    align="center"
                    sx={{ py: 6, opacity: 0.7 }}
                  >
                    <Box>
                      <Typography variant="body2">
                        Sin resultados para la búsqueda actual.
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={filtered.length}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRpp(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 25, 50]}
          labelRowsPerPage="Filas por página"
        />
      </CardContent>
    </Card>
  );
}
