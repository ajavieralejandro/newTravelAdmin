// src/components/atlas/AtlasToggle.tsx
'use client';

import * as React from 'react';
import { FormControlLabel, Switch, CircularProgress, Tooltip, Alert, Stack } from '@mui/material';

// ✅ Base ABSOLUTA al backend (usa env si está, si no travelconnect.com.ar)
const RAW_BASE = (process.env.NEXT_PUBLIC_API_BASE ?? '').trim();
const API_BASE = RAW_BASE !== '' ? RAW_BASE.replace(/\/+$/, '') : 'https://travelconnect.com.ar';
const apiUrl = (path: string) => `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;

// 🔎 logging helpers
const DEBUG = process.env.NODE_ENV !== 'production';
const nowMs = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
const hdrsToObj = (h: Headers) => {
  const o: Record<string, string> = {};
  h.forEach((v, k) => (o[k] = v));
  return o;
};

async function fetchJsonWithLog(
  url: string,
  options: RequestInit = {},
  label?: string,
  debugId?: string
) {
  const req: RequestInit = {
    cache: 'no-store',               // evita cache en dev
    credentials: 'include',          // mantené cookies si hacés auth por sancutm
    ...options,
  };
  req.headers = {
    ...(options.headers || {}),
    'X-Requested-With': 'XMLHttpRequest',
    'X-Debug-Id': debugId ?? '',
  };

  const t0 = nowMs();
  if (DEBUG) {
    console.groupCollapsed(`%c[AtlasToggle] ${label ?? ''} → ${req.method ?? 'GET'} ${url}`,
      'color:#8a2be2;font-weight:600');
    console.log('Request', { url, req });
  }

  const res = await fetch(url, req);
  const text = await res.text();
  let body: any = text;
  try { body = text ? JSON.parse(text) : null; } catch { /* deja text crudo */ }

  if (DEBUG) {
    console.log('Response', {
      status: res.status,
      ok: res.ok,
      ms: Math.round(nowMs() - t0),
      headers: hdrsToObj(res.headers),
      body,
    });
    console.groupEnd();
  }

  if (!res.ok) {
    const msg = typeof body === 'string' ? body : JSON.stringify(body);
    throw new Error(`HTTP ${res.status} - ${msg}`);
  }
  return body;
}

type ApiItem = { id: number; nombre: string; descripcion?: string | null };

type Props = {
  agenciaId?: number;
  /** Por si tu API se llama diferente (default: 'Atlas') */
  apiName?: string;
};

export default function AtlasToggle({ agenciaId, apiName = 'Atlas' }: Props) {
  const [initLoading, setInitLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [atlasId, setAtlasId] = React.useState<number | null>(null);
  const [enabled, setEnabled] = React.useState(false);

  // id corto para correlacionar logs de esta instancia
  const debugId = React.useMemo(() => Math.random().toString(36).slice(2, 8), []);

  React.useEffect(() => {
    if (DEBUG) {
      console.info('%c[AtlasToggle] Boot', 'color:#8a2be2;font-weight:700', {
        API_BASE,
        agenciaId,
        apiName,
        debugId,
      });
    }
  }, [agenciaId, apiName, debugId]);

  const findAtlasId = React.useCallback(async (): Promise<number | null> => {
    const list: ApiItem[] = await fetchJsonWithLog(
      apiUrl('/apis'),
      { method: 'GET' },
      'GET /apis',
      debugId
    );
    const target = list.find(a => (a.nombre ?? '').toLowerCase() === apiName.toLowerCase());
    if (DEBUG) console.log('[AtlasToggle] apis list:', list, '→ atlasId:', target?.id);
    return target?.id ?? null;
  }, [apiName, debugId]);

  const fetchCurrent = React.useCallback(
    async (aid: number, atlasApiId: number) => {
      const list: ApiItem[] = await fetchJsonWithLog(
        apiUrl(`/api_agencias/${aid}/apis`),
        { method: 'GET' },
        `GET /api_agencias/${aid}/apis`,
        debugId
      );
      const on = list.some(
        a => a.id === atlasApiId || (a.nombre ?? '').toLowerCase() === apiName.toLowerCase()
      );
      if (DEBUG) console.log('[AtlasToggle] agencia apis:', list, '→ enabled:', on);
      setEnabled(on);
    },
    [apiName, debugId]
  );

  React.useEffect(() => {
    (async () => {
      if (!agenciaId) return;
      setInitLoading(true);
      setError(null);
      try {
        const id = await findAtlasId();
        if (!id) throw new Error(`No se encontró la API "${apiName}" en /apis`);
        setAtlasId(id);
        await fetchCurrent(agenciaId, id);
      } catch (e: any) {
        setError(e?.message || 'Error inicializando el toggle');
      } finally {
        setInitLoading(false);
      }
    })();
  }, [agenciaId, findAtlasId, fetchCurrent, apiName]);

  const onToggle = async (_: React.ChangeEvent<HTMLInputElement>, next: boolean) => {
    if (!agenciaId || !atlasId) return;
    setSaving(true);
    setError(null);
    try {
      if (next) {
        // Activar
        await fetchJsonWithLog(
          apiUrl(`/api_agencias/${agenciaId}/apis`),
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ api_ids: [atlasId] }),
          },
          `POST /api_agencias/${agenciaId}/apis`,
          debugId
        );
        setEnabled(true);
      } else {
        // Desactivar
        await fetchJsonWithLog(
          apiUrl(`/api_agencias/${agenciaId}/apis/${atlasId}`),
          { method: 'DELETE' },
          `DELETE /api_agencias/${agenciaId}/apis/${atlasId}`,
          debugId
        );
        setEnabled(false);
      }
    } catch (e: any) {
      setError(e?.message || 'No se pudo cambiar el estado de la API');
      if (DEBUG) {
        // para inspección rápida desde consola
        (window as any).__AtlasToggleLastError = e;
      }
    } finally {
      setSaving(false);
    }
  };

  const disabled = !agenciaId || initLoading || saving || atlasId === null;

  return (
    <Stack spacing={1} direction="column" alignItems="flex-end">
      {error && <Alert severity="error" sx={{ py: 0.5, px: 1 }}>{error}</Alert>}
      <Tooltip title={disabled ? 'Cargando…' : (enabled ? `Desactivar ${apiName}` : `Activar ${apiName}`)}>
        <span>
          {initLoading ? (
            <CircularProgress size={20} />
          ) : (
            <FormControlLabel
              control={<Switch checked={enabled} onChange={onToggle} disabled={disabled} />}
              label={apiName}
            />
          )}
        </span>
      </Tooltip>
    </Stack>
  );
}
