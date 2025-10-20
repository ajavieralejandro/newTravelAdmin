// src/components/integrations/ApiIntegrationsPanel.tsx
'use client';

import * as React from 'react';
import {
  Box, Card, CardHeader, CardContent, List, ListItem,
  ListItemText, ListItemSecondaryAction, Switch, IconButton,
  Tooltip, Alert, CircularProgress, Stack, Typography, Divider, Chip, Link as MuiLink
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import RefreshIcon from '@mui/icons-material/Refresh';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import LinkIcon from '@mui/icons-material/Link';
import AtlasCredentialsButton from '../atlas/AtlasCredentialsButton';

// ✅ Base ABSOLUTA al backend (usa env si está, si no viaja a travelconnect.com.ar)
const RAW_BASE = (process.env.NEXT_PUBLIC_API_BASE ?? '').trim();
const API_BASE = RAW_BASE !== '' ? RAW_BASE.replace(/\/+$/, '') : 'https://travelconnect.com.ar';
const apiUrl = (path: string) => `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;

// Helpers
const normalize = (s?: string | null) => (s ?? '').toLowerCase().replace(/[\s_-]/g, '');

// === Tipos ===
export type ApiItem = {
  id: number;
  nombre: string;
  descripcion?: string | null;
  endpoint?: string | null;
  // slug opcional (tu /apis actual no lo trae; si más adelante lo agregás, mejor)
  slug?: string | null;
};

type Props = {
  agenciaId?: number;
};

type ActionBtnProps = {
  title: string;
  onClick: () => Promise<void> | void;
  icon?: React.ReactNode;
  disabled?: boolean;
};

function ActionBtn({ title, onClick, icon, disabled }: ActionBtnProps) {
  return (
    <Tooltip title={title}>
      <span>
        <IconButton size="small" onClick={() => void onClick()} disabled={!!disabled}>
          {icon ?? <PlayArrowIcon fontSize="small" />}
        </IconButton>
      </span>
    </Tooltip>
  );
}

/**
 * Deducción robusta del tipo de integración.
 * Usa nombre (principal) y endpoint como pistas.
 */
function deriveKeyFromApi(api: ApiItem): 'atlas' | 'allseasons' | 'julia' | 'travelgate' | 'ola' | 'other' {
  const n = normalize(api.nombre);
  const e = (api.endpoint ?? '').toLowerCase();

  // Atlas
  if (n.includes('atlas') || e.includes('api-atlas') || e.includes('netviax')) return 'atlas';

  // AllSeasons (tu endpoint actual es travel-tool + allseasons.xml)
  if (n.includes('allseasons') || e.includes('allseasons') || e.includes('travel-tool')) return 'allseasons';

  // Julia
  if (n.includes('julia') || e.includes('juliatours')) return 'julia';

  // TravelGate (tu /apis trae "TravelGate" como nombre)
  if (n.includes('travelgate') || e.includes('travelgate')) return 'travelgate';

  // OLA
  if (n === 'ola' || e.includes('wsola') || e.includes('ola.com.ar')) return 'ola';

  return 'other';
}

/**
 * Acciones específicas por integración + fallback genérico.
 */
function IntegrationActions({
  api,
  agenciaId,
  onAfter
}: {
  api: ApiItem;
  agenciaId?: number;
  onAfter?: () => void;
}) {
  const key = deriveKeyFromApi(api);

  const openInNew = (url: string) => {
    if (typeof window !== 'undefined') window.open(url, '_blank', 'noopener,noreferrer');
  };

  // --- ATLAS ---
  if (key === 'atlas') {
    return (
      <Stack direction="row" spacing={0.5} alignItems="center">
        <Tooltip title="Configurar credenciales de Atlas">
          <span>
            <AtlasCredentialsButton agenciaId={agenciaId} size="small" onSaved={onAfter} />
          </span>
        </Tooltip>
        {agenciaId ? (
          <ActionBtn
            title="Abrir paquetes (mix)"
            onClick={() => openInNew(apiUrl(`/paquetes-paginados?id=${agenciaId}&per_page=12`))}
            icon={<LinkIcon fontSize="small" />}
          />
        ) : null}
      </Stack>
    );
  }

  // --- ALL SEASONS ---
  if (key === 'allseasons') {
    return (
      <Stack direction="row" spacing={0.5} alignItems="center">
        <ActionBtn
          title="Ver solo AllSeasons"
          onClick={() => openInNew(apiUrl('/api/paquetes/allseasons?per_page=24'))}
          icon={<LinkIcon fontSize="small" />}
        />
        <ActionBtn
          title="Sincronizar AllSeasons (si está disponible)"
          onClick={async () => {
            try {
              const r = await fetch(apiUrl('/api/paquetes/allseasons/sync'), { method: 'POST', credentials: 'include' });
              if (!r.ok) throw new Error(`POST /api/paquetes/allseasons/sync → ${r.status}`);
              onAfter?.();
            } catch (err) {
              console.warn('Sync AllSeasons no disponible:', err);
              alert('Endpoint de sync AllSeasons no disponible (creá /api/paquetes/allseasons/sync en el backend).');
            }
          }}
          icon={<RefreshIcon fontSize="small" />}
        />
      </Stack>
    );
  }

  // --- JULIA ---
  if (key === 'julia') {
    return (
      <Stack direction="row" spacing={0.5} alignItems="center">
        <ActionBtn
          title="Enviar/Actualizar paquetes a Julia"
          onClick={async () => {
            try {
              const r = await fetch(apiUrl('/paquetes_julia'), { method: 'POST', credentials: 'include' });
              if (!r.ok) throw new Error(`POST /paquetes_julia → ${r.status}`);
              onAfter?.();
            } catch (err) {
              console.warn('Julia sync error:', err);
              alert('No se pudo ejecutar /paquetes_julia. Verifica el endpoint.');
            }
          }}
          icon={<RefreshIcon fontSize="small" />}
        />
      </Stack>
    );
  }

  // --- TRAVELGATE ---
  if (key === 'travelgate') {
    return (
      <Stack direction="row" spacing={0.5} alignItems="center">
        <ActionBtn
          title="Introspección GraphQL"
          onClick={() => openInNew(apiUrl('/graphql/introspect'))}
          icon={<LinkIcon fontSize="small" />}
        />
        <ActionBtn
          title="Probar búsqueda TGX"
          onClick={() => openInNew(apiUrl('/tgx/search'))}
          icon={<PlayArrowIcon fontSize="small" />}
        />
      </Stack>
    );
  }

  // --- OLA (placeholder) ---
  if (key === 'ola') {
    return (
      <Stack direction="row" spacing={0.5} alignItems="center">
        <Tooltip title="Próximamente: acciones para OLA">
          <span>
            <IconButton size="small" disabled>
              <SettingsIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </Stack>
    );
  }

  // --- Fallback genérico: si hay endpoint, mostramos link ---
  if (api.endpoint) {
    return (
      <Stack direction="row" spacing={0.5} alignItems="center">
        <ActionBtn title="Abrir endpoint" onClick={() => openInNew(api.endpoint!)} icon={<LinkIcon fontSize="small" />} />
      </Stack>
    );
  }

  return null;
}

export default function ApiIntegrationsPanel({ agenciaId }: Props) {
  const [loading, setLoading] = React.useState(true);
  const [savingId, setSavingId] = React.useState<number | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const [allApis, setAllApis] = React.useState<ApiItem[]>([]);
  const [enabledIds, setEnabledIds] = React.useState<Set<number>>(new Set());

  const fetchAll = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1) SIEMPRE cargar TODAS las APIs (aunque no haya agenciaId)
      const rAll = await fetch(apiUrl('/apis'), { credentials: 'include' });
      if (!rAll.ok) throw new Error(`GET /apis HTTP ${rAll.status}`);
      const apis: ApiItem[] = await rAll.json();
      setAllApis(apis);

      // 2) Solo si hay agenciaId, cargar las habilitadas para esa agencia
      if (agenciaId) {
        const rAgency = await fetch(apiUrl(`/api_agencias/${agenciaId}/apis`), { credentials: 'include' });
        if (!rAgency.ok) throw new Error(`GET /api_agencias/${agenciaId}/apis HTTP ${rAgency.status}`);
        const agencyApis: ApiItem[] = await rAgency.json();
        setEnabledIds(new Set(agencyApis.map(a => a.id)));
      } else {
        setEnabledIds(new Set());
      }
    } catch (e: any) {
      setError(e?.message || 'No se pudo cargar la lista de APIs');
    } finally {
      setLoading(false);
    }
  }, [agenciaId]);

  React.useEffect(() => { fetchAll(); }, [fetchAll]);

  const toggleApi = async (api: ApiItem, next: boolean) => {
    if (!agenciaId) {
      setError('Necesitás seleccionar una agencia para activar/desactivar integraciones.');
      return;
    }
    setSavingId(api.id);
    setError(null);
    try {
      if (next) {
        // Activar => POST syncWithoutDetaching
        const r = await fetch(apiUrl(`/api_agencias/${agenciaId}/apis`), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
          credentials: 'include',
          body: JSON.stringify({ api_ids: [api.id] }),
        });
        if (!r.ok) throw new Error(`POST /api_agencias/${agenciaId}/apis HTTP ${r.status}`);
        setEnabledIds(prev => new Set(prev).add(api.id));
      } else {
        // Desactivar => DELETE detach
        const r = await fetch(apiUrl(`/api_agencias/${agenciaId}/apis/${api.id}`), {
          method: 'DELETE',
          headers: { 'X-Requested-With': 'XMLHttpRequest' },
          credentials: 'include',
        });
        if (!r.ok) throw new Error(`DELETE /api_agencias/${agenciaId}/apis/${api.id} HTTP ${r.status}`);
        setEnabledIds(prev => {
          const n = new Set(prev);
          n.delete(api.id);
          return n;
        });
      }
    } catch (e: any) {
      setError(e?.message || 'No se pudo cambiar el estado de la API');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <Card variant="outlined">
      <CardHeader
        title="Integraciones de la Agencia"
        subheader={agenciaId ? `Agencia #${agenciaId}` : 'Agencia no seleccionada (solo lectura)'}
        action={
          <Tooltip title="Recargar">
            <span>
              <IconButton onClick={fetchAll} disabled={loading}>
                {loading ? <CircularProgress size={18} /> : <RefreshIcon />}
              </IconButton>
            </span>
          </Tooltip>
        }
      />
      <Divider />
      <CardContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Stack alignItems="center" py={4}><CircularProgress /></Stack>
        ) : (
          <>
            {allApis.length === 0 ? (
              <Typography color="text.secondary">No hay APIs registradas.</Typography>
            ) : (
              <List disablePadding>
                {allApis.map((api) => {
                  const enabled = enabledIds.has(api.id);
                  const savingThis = savingId === api.id;
                  const key = deriveKeyFromApi(api);

                  return (
                    <React.Fragment key={api.id}>
                      <ListItem divider>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                              <Typography fontWeight={600}>{api.nombre}</Typography>
                              <Chip
                                size="small"
                                label={enabled ? 'Activo' : 'Inactivo'}
                                color={enabled ? 'success' : 'default'}
                                variant={enabled ? 'filled' : 'outlined'}
                              />
                              {/* Enlace al endpoint (si lo provee /apis) */}
                              {api.endpoint && (
                                <MuiLink href={api.endpoint} target="_blank" rel="noopener" underline="hover">
                                  <Stack direction="row" spacing={0.5} alignItems="center">
                                    <LinkIcon fontSize="small" />
                                    <Typography variant="body2">endpoint</Typography>
                                  </Stack>
                                </MuiLink>
                              )}
                              {/* Atajos según integración */}
                              {key === 'allseasons' && (
                                <MuiLink href={apiUrl('/api/paquetes/allseasons')} target="_blank" rel="noopener" underline="hover">
                                  <Stack direction="row" spacing={0.5} alignItems="center">
                                    <LinkIcon fontSize="small" />
                                    <Typography variant="body2">listar</Typography>
                                  </Stack>
                                </MuiLink>
                              )}
                              {key === 'atlas' && agenciaId && (
                                <MuiLink href={apiUrl(`/paquetes-paginados?id=${agenciaId}`)} target="_blank" rel="noopener" underline="hover">
                                  <Stack direction="row" spacing={0.5} alignItems="center">
                                    <LinkIcon fontSize="small" />
                                    <Typography variant="body2">paquetes</Typography>
                                  </Stack>
                                </MuiLink>
                              )}
                            </Box>
                          }
                          secondary={api.descripcion ?? ''}
                        />
                        <ListItemSecondaryAction>
                          {/* Acciones específicas + fallback */}
                          <IntegrationActions api={api} agenciaId={agenciaId} onAfter={fetchAll} />

                          {/* Toggle (solo si hay agencia seleccionada) */}
                          <Tooltip title={agenciaId ? (enabled ? 'Desactivar' : 'Activar') : 'Seleccioná una agencia para activar/desactivar'}>
                            <span>
                              <Switch
                                checked={enabled}
                                onChange={(_, next) => toggleApi(api, next)}
                                disabled={savingThis || !agenciaId}
                              />
                            </span>
                          </Tooltip>
                        </ListItemSecondaryAction>
                      </ListItem>
                    </React.Fragment>
                  );
                })}
              </List>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
