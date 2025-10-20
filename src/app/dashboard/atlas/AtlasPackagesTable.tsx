'use client';
/* eslint-disable no-console */

import * as React from 'react';
import {
  Card, CardHeader, CardContent, Divider, TextField, InputAdornment, IconButton,
  Table, TableBody, TableCell, TableHead, TableRow, TableContainer, TablePagination,
  LinearProgress, Stack, Chip, Alert
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';

type AtlasItem = {
  paquete_id: number;
  paquete_externo_id?: string | null;
  creado?: boolean;
  salida_id?: number | null;
  titulo?: string | null;
};

type AtlasResponse = {
  ok: boolean;
  cant: number;
  items: AtlasItem[];
  agencia?: string;
  endpoint?: string;
  tiempo_ms?: number;
  payload_enviado?: unknown;
};

const DEBUG = true;
const log = (...a: any[]) => { if (DEBUG) console.debug('[AtlasPackagesTable]', ...a); };

function toNumber(x: unknown): number | null {
  if (x == null) return null;
  if (typeof x === 'number') return Number.isFinite(x) ? x : null;
  const n = parseInt(String(x).trim(), 10);
  return Number.isFinite(n) ? n : null;
}

async function fetchPaquetes(agenciaId: number, signal?: AbortSignal): Promise<AtlasResponse> {
  const base = process.env.NEXT_PUBLIC_API_BASE ?? 'https://travelconnect.com.ar/api';
  const url  = `${base}/atlas/agencias/${agenciaId}/importar-paquetes`;

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

  return {
    ok: Boolean(json?.ok),
    cant: Number(json?.cant ?? (Array.isArray(json?.items) ? json.items.length : 0)),
    items: Array.isArray(json?.items) ? (json.items as AtlasItem[]) : [],
    agencia: typeof json?.agencia === 'string' ? json.agencia : undefined,
    endpoint: typeof json?.endpoint === 'string' ? json.endpoint : undefined,
    tiempo_ms: typeof json?.tiempo_ms === 'number' ? json.tiempo_ms : undefined,
    payload_enviado: json?.payload_enviado
  };
}

export function AtlasPackagesTable({
  idAgencia,
}: {
  idAgencia: number | string | undefined;
}) {
  // ✅ usar SOLO el id que viene por prop
  const agenciaNumericId = React.useMemo(() => {
    const n = toNumber(idAgencia);
    log('memo agenciaNumericId ←', { raw: idAgencia, parsed: n, valid: n !== null });
    return n;
  }, [idAgencia]);

  const [rows, setRows] = React.useState<AtlasItem[]>([]);
  const [meta, setMeta] = React.useState<Pick<AtlasResponse, 'ok' | 'cant' | 'agencia' | 'tiempo_ms'>>({});
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
        ok: data.ok, cant: data.cant, agencia: data.agencia, tiempo_ms: data.tiempo_ms
      });
      setRows(data.items ?? []);
      setMeta({ ok: data.ok, cant: data.cant, agencia: data.agencia, tiempo_ms: data.tiempo_ms });
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

  // 🔁 cuando cambia el ID, disparamos la carga
  React.useEffect(() => {
    log('effect id change →', { agenciaNumericId });
    if (agenciaNumericId) {
      void load();
    } else {
      setRows([]);
      setMeta({});
    }
  }, [agenciaNumericId, load]);

  // Logs auxiliares
  React.useEffect(() => { log('rows changed →', rows.length); }, [rows]);
  React.useEffect(() => { log('search query changed →', q); }, [q]);
  React.useEffect(() => { log('pagination changed →', { page, rowsPerPage }); }, [page, rowsPerPage]);

  const filtered = React.useMemo(() => {
    if (!q) return rows;
    const needle = q.toLowerCase();
    return rows.filter(p =>
      (p.titulo ?? '').toLowerCase().includes(needle) ||
      (p.paquete_externo_id ?? '').toLowerCase().includes(needle) ||
      String(p.paquete_id).includes(needle) ||
      String(p.salida_id ?? '').includes(needle)
    );
  }, [rows, q]);

  const pageRows = React.useMemo(() => {
    const start = page * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, page, rowsPerPage]);

  const sub = agenciaNumericId
    ? `(Agencia #${agenciaNumericId})`
    : 'Ingresá/seleccioná un ID de agencia válido';

  return (
    <Card>
      <CardHeader
        title="Paquetes importados desde Atlas"
        subheader={sub}
        action={
          <IconButton onClick={() => { log('click recargar'); void load(); }} aria-label="recargar">
            <RefreshIcon />
          </IconButton>
        }
      />
      <Divider />
      <CardContent>
        {!agenciaNumericId && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Ingresá/seleccioná un <strong>ID de agencia</strong> válido para iniciar la consulta.
          </Alert>
        )}

        <Stack direction="row" spacing={1} sx={{ mb: 1 }} alignItems="center" flexWrap="wrap">
          {typeof meta.ok === 'boolean' && (
            <Chip size="small" label={meta.ok ? 'OK' : 'ERROR'} color={meta.ok ? 'success' : 'error'} />
          )}
          {typeof meta.cant === 'number' && <Chip size="small" label={`Items: ${meta.cant}`} />}
          {typeof meta.tiempo_ms === 'number' && <Chip size="small" label={`Tiempo: ${meta.tiempo_ms} ms`} />}
          <Chip size="small" label={`rows: ${rows.length}`} />
          <Chip size="small" label={`loading: ${String(loading)}`} />
        </Stack>

        <TextField
          fullWidth
          placeholder="Buscar por título, ID paquete, ID externo o ID de salida…"
          value={q}
          onChange={(e) => { setQ(e.target.value); setPage(0); }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start"><SearchIcon /></InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />

        {loading && <LinearProgress sx={{ mb: 2 }} />}
        {error && !loading && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Paquete</TableCell>
                <TableCell>ID externo</TableCell>
                <TableCell>Salida ID</TableCell>
                <TableCell>Estado</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pageRows.map((p) => (
                <TableRow key={`${p.paquete_id}-${p.salida_id ?? 's'}`} hover>
                  <TableCell>
                    <Stack spacing={0.5}>
                      <strong>{p.titulo ?? '—'}</strong>
                      <span style={{ opacity: 0.7, fontSize: 12 }}>Paquete #{p.paquete_id}</span>
                    </Stack>
                  </TableCell>
                  <TableCell>{p.paquete_externo_id ?? '—'}</TableCell>
                  <TableCell>{p.salida_id ?? '—'}</TableCell>
                  <TableCell>
                    {typeof p.creado === 'boolean'
                      ? <Chip size="small" label={p.creado ? 'Creado' : 'No creado'} color={p.creado ? 'success' : 'default'} />
                      : '—'}
                  </TableCell>
                </TableRow>
              ))}

              {!loading && pageRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 6, opacity: 0.7 }}>
                    Sin resultados.
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
          onRowsPerPageChange={(e) => { setRpp(parseInt(e.target.value, 10)); setPage(0); }}
          rowsPerPageOptions={[10, 25, 50]}
        />
      </CardContent>
    </Card>
  );
}
