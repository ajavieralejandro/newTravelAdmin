// src/components/integrations/ApiIntegrationsPanel.tsx
'use client';

import * as React from 'react';
import {
  Box,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Stack,
  Typography,
  Divider,
  Chip,
  Link as MuiLink,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import RefreshIcon from '@mui/icons-material/Refresh';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import LinkIcon from '@mui/icons-material/Link';
import PaymentIcon from '@mui/icons-material/Payment';

import AtlasCredentialsButton from '../atlas/AtlasCredentialsButton';

// ✅ Base ABSOLUTA al backend
const RAW_BASE = (process.env.NEXT_PUBLIC_API_BASE ?? '').trim();
const API_BASE =
  RAW_BASE !== '' ? RAW_BASE.replace(/\/+$/, '') : 'https://travelconnect.com.ar';
const apiUrl = (path: string) =>
  `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
const normalize = (s?: string | null) =>
  (s ?? '').toLowerCase().replace(/[\s_-]/g, '');

// === Tipos ===
export type ApiItem = {
  id: number;
  nombre: string;
  descripcion?: string | null;
  endpoint?: string | null;
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
        <IconButton
          size="small"
          onClick={() => void onClick()}
          disabled={!!disabled}
          sx={{ borderRadius: 2 }}
        >
          {icon ?? <PlayArrowIcon fontSize="small" />}
        </IconButton>
      </span>
    </Tooltip>
  );
}

/* =========================================================
 * MERCADO PAGO: diálogo para ver/editar credenciales
 *  - GET  /api/mercadopago/agencias/{agencia}/credenciales
 *  - PUT  /api/mercadopago/agencias/{agencia}/credenciales
 * ========================================================= */

type MercadoPagoConfig = {
  public_key: string;
  sandbox: boolean;
  notification_url: string;
};

function MercadoPagoCredentialsButton({
  agenciaId,
  onSaved,
}: {
  agenciaId?: number;
  onSaved?: () => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [form, setForm] = React.useState<MercadoPagoConfig>({
    public_key: '',
    sandbox: false,
    notification_url: '',
  });

  // access_token nunca se muestra, sólo se envía si lo completan
  const [accessToken, setAccessToken] = React.useState('');

  const handleOpen = () => {
    if (!agenciaId) return;
    setOpen(true);
  };

  const handleClose = () => {
    if (saving) return;
    setOpen(false);
    setError(null);
    setAccessToken('');
  };

  const fetchConfig = React.useCallback(async () => {
    if (!agenciaId) return;
    setLoading(true);
    setError(null);
    try {
      const r = await fetch(
        apiUrl(`/api/mercadopago/agencias/${agenciaId}/credenciales`),
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
          },
        }
      );

      if (r.status === 404) {
        // Sin config todavía → dejamos vacíos
        setForm({
          public_key: '',
          sandbox: false,
          notification_url: '',
        });
        return;
      }

      if (!r.ok) {
        throw new Error(
          `GET /api/mercadopago/agencias/${agenciaId}/credenciales → ${r.status}`
        );
      }

      const data = await r.json();

      setForm({
        public_key: data.public_key ?? '',
        sandbox: !!data.sandbox,
        notification_url: data.notification_url ?? '',
      });
    } catch (e: any) {
      console.error('Error cargando config MercadoPago:', e);
      setError(
        e?.message ||
          'No se pudieron cargar las credenciales de Mercado Pago para esta agencia.'
      );
    } finally {
      setLoading(false);
    }
  }, [agenciaId]);

  React.useEffect(() => {
    if (open && agenciaId) {
      void fetchConfig();
    }
  }, [open, agenciaId, fetchConfig]);

  const handleSave = async () => {
    if (!agenciaId) return;
    setSaving(true);
    setError(null);
    try {
      const payload: any = {
        public_key: form.public_key || null,
        sandbox: form.sandbox,
        notification_url: form.notification_url || null,
      };

      if (accessToken.trim() !== '') {
        payload.access_token = accessToken.trim();
      }

      const r = await fetch(
        apiUrl(`/api/mercadopago/agencias/${agenciaId}/credenciales`),
        {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
          body: JSON.stringify(payload),
        }
      );

      if (!r.ok) {
        throw new Error(
          `PUT /api/mercadopago/agencias/${agenciaId}/credenciales → ${r.status}`
        );
      }

      onSaved?.();
      setOpen(false);
      setAccessToken('');
    } catch (e: any) {
      console.error('Error guardando config MercadoPago:', e);
      setError(e?.message || 'No se pudieron guardar las credenciales de Mercado Pago.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Tooltip
        title={
          agenciaId
            ? 'Ver / editar credenciales de Mercado Pago de esta agencia'
            : 'Seleccioná una agencia para configurar Mercado Pago'
        }
      >
        <span>
          <Button
            size="small"
            variant="outlined"
            startIcon={<PaymentIcon fontSize="small" />}
            onClick={handleOpen}
            disabled={!agenciaId}
            sx={{ borderRadius: 999, textTransform: 'none', fontSize: 12 }}
          >
            Credenciales MP
          </Button>
        </span>
      </Tooltip>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Credenciales de Mercado Pago</DialogTitle>
        <DialogContent dividers>
          {loading ? (
            <Stack alignItems="center" py={3}>
              <CircularProgress />
            </Stack>
          ) : (
            <Stack spacing={2} mt={1}>
              {error && <Alert severity="error">{error}</Alert>}

              <TextField
                label="Public key"
                fullWidth
                size="small"
                value={form.public_key}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, public_key: e.target.value }))
                }
                placeholder="APP_USR-..."
              />

              <TextField
                label="Access token"
                fullWidth
                size="small"
                type="password"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                placeholder="Sólo se envía si lo completás (no se muestra nunca)"
                helperText="Por seguridad, el access token no se devuelve desde el backend. Si lo cargás acá, se actualizará."
              />

              <TextField
                label="Notification URL"
                fullWidth
                size="small"
                type="url"
                value={form.notification_url}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    notification_url: e.target.value,
                  }))
                }
                placeholder="https://travelconnect.com.ar/mercadopago/webhook"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={form.sandbox}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        sandbox: e.target.checked,
                      }))
                    }
                  />
                }
                label="Sandbox (modo prueba)"
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={saving || loading || !agenciaId}
            startIcon={saving ? <CircularProgress size={16} /> : <PaymentIcon />}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

/**
 * Clasifica la API por tipo, incluyendo Mercado Pago.
 */
function deriveKeyFromApi(
  api: ApiItem
): 'atlas' | 'allseasons' | 'julia' | 'travelgate' | 'ola' | 'mercadopago' | 'other' {
  const n = normalize(api.nombre);
  const e = (api.endpoint ?? '').toLowerCase();

  // Mercado Pago
  if (
    n.includes('mercadopago') ||
    (n.includes('mercado') && n.includes('pago')) ||
    e.includes('mercadopago')
  ) {
    return 'mercadopago';
  }

  if (n.includes('atlas') || e.includes('api-atlas') || e.includes('netviax')) return 'atlas';
  if (n.includes('allseasons') || e.includes('allseasons') || e.includes('travel-tool'))
    return 'allseasons';
  if (n.includes('julia') || e.includes('juliatours')) return 'julia';
  if (n.includes('travelgate') || e.includes('travelgate')) return 'travelgate';
  if (n === 'ola' || e.includes('wsola') || e.includes('ola.com.ar')) return 'ola';

  return 'other';
}

/**
 * Acciones específicas por integración (Atlas, AllSeasons, Julia, TravelGate, OLA, MercadoPago)
 * + fallback genérico.
 */
function IntegrationActions({
  api,
  agenciaId,
  onAfter,
}: {
  api: ApiItem;
  agenciaId?: number;
  onAfter?: () => void;
}) {
  const key = deriveKeyFromApi(api);

  const openInNew = (url: string) => {
    if (typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  // --- ATLAS ---
  if (key === 'atlas') {
    return (
      <Stack direction="row" spacing={0.75} alignItems="center">
        <Tooltip title="Configurar credenciales de Atlas">
          <Box
            sx={{
              '& button': {
                borderRadius: 999,
                textTransform: 'none',
                px: 1.5,
                py: 0.5,
                fontSize: 12,
              },
            }}
          >
            <AtlasCredentialsButton agenciaId={agenciaId} size="small" onSaved={onAfter} />
          </Box>
        </Tooltip>

        {agenciaId ? (
          <ActionBtn
            title="Ver paquetes de Atlas"
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
      <Stack direction="row" spacing={0.75} alignItems="center">
        <ActionBtn
          title="Ver solo AllSeasons"
          onClick={() => openInNew(apiUrl('/api/paquetes/allseasons?per_page=24'))}
          icon={<LinkIcon fontSize="small" />}
        />
        <ActionBtn
          title="Sincronizar AllSeasons (si está disponible)"
          onClick={async () => {
            try {
              const r = await fetch(apiUrl('/api/paquetes/allseasons/sync'), {
                method: 'POST',
                credentials: 'include',
              });
              if (!r.ok) throw new Error(`POST /api/paquetes/allseasons/sync → ${r.status}`);
              onAfter?.();
            } catch (err) {
              console.warn('Sync AllSeasons no disponible:', err);
              alert(
                'Endpoint de sync AllSeasons no disponible (creá /api/paquetes/allseasons/sync en el backend).'
              );
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
      <Stack direction="row" spacing={0.75} alignItems="center">
        <ActionBtn
          title="Enviar/Actualizar paquetes a Julia"
          onClick={async () => {
            try {
              const r = await fetch(apiUrl('/paquetes_julia'), {
                method: 'POST',
                credentials: 'include',
              });
              if (!r.ok) throw new Error(`POST /paquetes_julia → ${r.status}`);
              onAfter?.();
            } catch (err) {
              console.warn('Julia sync error:', err);
              alert('No se pudo ejecutar /paquetes_julia. Verificá el endpoint.');
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
      <Stack direction="row" spacing={0.75} alignItems="center">
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
      <Stack direction="row" spacing={0.75} alignItems="center">
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

  // --- MERCADO PAGO ---
  if (key === 'mercadopago') {
    return (
      <Stack direction="row" spacing={0.75} alignItems="center">
        <MercadoPagoCredentialsButton agenciaId={agenciaId} onSaved={onAfter} />
        {/* opcional: mantener acceso al panel clásico si existe */}
        <ActionBtn
          title="Abrir panel clásico de Mercado Pago"
          onClick={() => openInNew(apiUrl('/mercadopago'))}
          icon={<PaymentIcon fontSize="small" />}
        />
      </Stack>
    );
  }

  // --- Fallback genérico: si hay endpoint, mostramos link ---
  if (api.endpoint) {
    return (
      <Stack direction="row" spacing={0.75} alignItems="center">
        <ActionBtn
          title="Abrir endpoint"
          onClick={() => openInNew(api.endpoint!)}
          icon={<LinkIcon fontSize="small" />}
        />
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
      const rAll = await fetch(apiUrl('/apis'), { credentials: 'include' });
      if (!rAll.ok) throw new Error(`GET /apis HTTP ${rAll.status}`);
      const apis: ApiItem[] = await rAll.json();
      setAllApis(apis);

      if (agenciaId) {
        const rAgency = await fetch(apiUrl(`/api_agencias/${agenciaId}/apis`), {
          credentials: 'include',
        });
        if (!rAgency.ok)
          throw new Error(`GET /api_agencias/${agenciaId}/apis HTTP ${rAgency.status}`);
        const agencyApis: ApiItem[] = await rAgency.json();
        setEnabledIds(new Set(agencyApis.map((a) => a.id)));
      } else {
        setEnabledIds(new Set());
      }
    } catch (e: any) {
      setError(e?.message || 'No se pudo cargar la lista de APIs');
    } finally {
      setLoading(false);
    }
  }, [agenciaId]);

  React.useEffect(() => {
    fetchAll();
  }, [fetchAll]);

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
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
          credentials: 'include',
          body: JSON.stringify({ api_ids: [api.id] }),
        });
        if (!r.ok)
          throw new Error(`POST /api_agencias/${agenciaId}/apis HTTP ${r.status}`);
        setEnabledIds((prev) => new Set(prev).add(api.id));
      } else {
        // Desactivar => DELETE detach
        const r = await fetch(apiUrl(`/api_agencias/${agenciaId}/apis/${api.id}`), {
          method: 'DELETE',
          headers: { 'X-Requested-With': 'XMLHttpRequest' },
          credentials: 'include',
        });
        if (!r.ok)
          throw new Error(
            `DELETE /api_agencias/${agenciaId}/apis/${api.id} HTTP ${r.status}`
          );
        setEnabledIds((prev) => {
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
    <Card
      variant="outlined"
      sx={{
        borderRadius: 3,
        borderColor: 'divider',
      }}
    >
      <CardContent>
        {/* Toolbar minimalista solo con el botón de recargar */}
        <Stack direction="row" justifyContent="flex-end" alignItems="center" mb={1}>
          <Tooltip title="Recargar integraciones">
            <span>
              <IconButton onClick={fetchAll} disabled={loading}>
                {loading ? <CircularProgress size={18} /> : <RefreshIcon />}
              </IconButton>
            </span>
          </Tooltip>
        </Stack>

        <Divider sx={{ mb: 2 }} />

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Stack alignItems="center" py={4}>
            <CircularProgress />
          </Stack>
        ) : allApis.length === 0 ? (
          <Typography color="text.secondary">No hay APIs registradas.</Typography>
        ) : (
          <List disablePadding>
            {allApis.map((api) => {
              const enabled = enabledIds.has(api.id);
              const savingThis = savingId === api.id;
              const key = deriveKeyFromApi(api);

              return (
                <ListItem
                  key={api.id}
                  divider
                  sx={{
                    alignItems: 'flex-start',
                    py: 1.5,
                  }}
                >
                  <ListItemText
                    primary={
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          flexWrap: 'wrap',
                        }}
                      >
                        <Typography fontWeight={600}>{api.nombre}</Typography>
                        <Chip
                          size="small"
                          label={enabled ? 'Activo' : 'Inactivo'}
                          color={enabled ? 'success' : 'default'}
                          variant={enabled ? 'filled' : 'outlined'}
                        />
                        <Chip
                          size="small"
                          label={
                            key === 'atlas'
                              ? 'Atlas'
                              : key === 'allseasons'
                              ? 'AllSeasons'
                              : key === 'julia'
                              ? 'Julia'
                              : key === 'travelgate'
                              ? 'TravelGateX'
                              : key === 'ola'
                              ? 'OLA'
                              : key === 'mercadopago'
                              ? 'Mercado Pago'
                              : 'Genérico'
                          }
                          variant="outlined"
                          sx={{ fontSize: 11 }}
                        />

                        {/* Enlace al endpoint si viene desde /apis */}
                        {api.endpoint && (
                          <MuiLink
                            href={api.endpoint}
                            target="_blank"
                            rel="noopener"
                            underline="hover"
                            sx={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 0.5,
                            }}
                          >
                            <LinkIcon fontSize="small" />
                            <Typography variant="body2">endpoint</Typography>
                          </MuiLink>
                        )}

                        {/* Atajos según integración */}
                        {key === 'allseasons' && (
                          <MuiLink
                            href={apiUrl('/api/paquetes/allseasons')}
                            target="_blank"
                            rel="noopener"
                            underline="hover"
                            sx={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 0.5,
                            }}
                          >
                            <LinkIcon fontSize="small" />
                            <Typography variant="body2">listar</Typography>
                          </MuiLink>
                        )}
                        {key === 'atlas' && agenciaId && (
                          <MuiLink
                            href={apiUrl(`/paquetes-paginados?id=${agenciaId}`)}
                            target="_blank"
                            rel="noopener"
                            underline="hover"
                            sx={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 0.5,
                            }}
                          >
                            <LinkIcon fontSize="small" />
                            <Typography variant="body2">paquetes</Typography>
                          </MuiLink>
                        )}
                        {key === 'mercadopago' && (
                          <MuiLink
                            href={apiUrl('/mercadopago')}
                            target="_blank"
                            rel="noopener"
                            underline="hover"
                            sx={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 0.5,
                            }}
                          >
                            <PaymentIcon fontSize="small" />
                            <Typography variant="body2">panel MP</Typography>
                          </MuiLink>
                        )}
                      </Box>
                    }
                    secondary={
                      key === 'mercadopago'
                        ? 'Usá el switch para habilitar o deshabilitar los cobros con Mercado Pago y el botón para editar las credenciales.'
                        : api.descripcion ?? ''
                    }
                  />
                  <ListItemSecondaryAction>
                    <Stack direction="row" spacing={1} alignItems="center">
                      {/* Acciones específicas + fallback */}
                      <IntegrationActions api={api} agenciaId={agenciaId} onAfter={fetchAll} />

                      {/* Este switch es lo que conecta/desconecta Mercado Pago también */}
                      <Tooltip
                        title={
                          agenciaId
                            ? enabled
                              ? 'Desactivar integración'
                              : 'Activar integración'
                            : 'Seleccioná una agencia para activar/desactivar'
                        }
                      >
                        <span>
                          <Switch
                            checked={enabled}
                            onChange={(_, next) => toggleApi(api, next)}
                            disabled={savingThis || !agenciaId}
                          />
                        </span>
                      </Tooltip>
                    </Stack>
                  </ListItemSecondaryAction>
                </ListItem>
              );
            })}
          </List>
        )}
      </CardContent>
    </Card>
  );
}
