// src/components/atlas/AtlasCredentialsButton.tsx
'use client';

import * as React from 'react';
import {
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Stack, Alert, IconButton, InputAdornment, Tooltip,
  CircularProgress, LinearProgress
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

type Props = {
  agenciaId?: number;
  initial?: { usuario?: string | null; empresa?: string | null; sucursal?: string | null; };
  onSaved?: (payload: { atlas_usuario: string; atlas_empresa: string; atlas_sucursal: string; }) => void;
  size?: 'small' | 'medium' | 'large';
  authToken?: string;
};

type ValidationErrors = Partial<Record<'atlas_usuario'|'atlas_clave'|'atlas_empresa'|'atlas_sucursal', string[]>>;

// Backend Laravel
const API_BASE = 'https://travelconnect.com.ar';

// Helper para evitar dobles barras
const apiUrl = (path: string) => `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;

export default function AtlasCredentialsButton({
  agenciaId,
  initial,
  onSaved,
  size = 'small',
  authToken,
}: Props) {
  const [open, setOpen] = React.useState(false);
  const [loadingInit, setLoadingInit] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [showPass, setShowPass] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [okMsg, setOkMsg] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<ValidationErrors>({});

  const [usuario, setUsuario]   = React.useState(initial?.usuario ?? '');
  const [empresa, setEmpresa]   = React.useState(initial?.empresa ?? '');
  const [sucursal, setSucursal] = React.useState(initial?.sucursal ?? '');
  const [clave, setClave]       = React.useState('');

  React.useEffect(() => {
    if (!open) {
      setUsuario(initial?.usuario ?? '');
      setEmpresa(initial?.empresa ?? '');
      setSucursal(initial?.sucursal ?? '');
      setClave('');
    }
  }, [initial?.usuario, initial?.empresa, initial?.sucursal, open]);

  const commonHeaders: HeadersInit = {
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
  };

  const fetchCurrent = React.useCallback(async () => {
    if (!agenciaId) return;
    setLoadingInit(true);
    setServerError(null);
    try {
      // ✅ GET /api/agencias/{id}/credenciales
      const res = await fetch(apiUrl(`/api/agencias/${agenciaId}/credenciales`), {
        method: 'GET',
        headers: commonHeaders,
        credentials: 'include',
      });

      const text = await res.text();
      const data = (() => { try { return JSON.parse(text); } catch { return null; } })();

      if (!res.ok) {
        setServerError(data?.error || `No se pudieron cargar las credenciales (HTTP ${res.status}).`);
      } else {
        setUsuario(data?.atlas_usuario ?? '');
        setEmpresa(data?.atlas_empresa ?? '');
        setSucursal(data?.atlas_sucursal ?? '');
        setClave('');
      }
    } catch (e: any) {
      setServerError(e?.message || 'Error de red al leer credenciales.');
    } finally {
      setLoadingInit(false);
    }
  }, [agenciaId, authToken]);

  const handleOpen = () => {
    setOkMsg(null);
    setFieldErrors({});
    setOpen(true);
    if (agenciaId) fetchCurrent();
  };

  const handleClose = () => setOpen(false);

  const submit = async () => {
    if (!agenciaId) return;
    setSaving(true);
    setServerError(null);
    setOkMsg(null);
    setFieldErrors({});

    try {
      // ✅ PUT /api/agencias/{id}/credenciales
      const res = await fetch(apiUrl(`/api/agencias/${agenciaId}/credenciales`), {
        method: 'PUT',
        headers: { ...commonHeaders, 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          atlas_usuario:  usuario,
          atlas_clave:    clave,
          atlas_empresa:  empresa,
          atlas_sucursal: sucursal,
        }),
      });

      const text = await res.text();
      const data = (() => { try { return JSON.parse(text); } catch { return null; } })();

      if (!res.ok) {
        if (res.status === 422 && data?.details) {
          setFieldErrors(data.details as ValidationErrors);
        } else {
          setServerError(
            data?.error
              ? (data?.details
                  ? `${data.error}: ${typeof data.details === 'string' ? data.details : JSON.stringify(data.details)}`
                  : data.error)
              : `Error HTTP ${res.status}`
          );
        }
        setSaving(false);
        return;
      }

      setOkMsg(data?.message ?? 'Credenciales actualizadas');
      onSaved?.({ atlas_usuario: usuario, atlas_empresa: empresa, atlas_sucursal: sucursal });
      setSaving(false);
      setTimeout(() => setOpen(false), 900);
    } catch (e: any) {
      setServerError(e?.message || 'Error de red');
      setSaving(false);
    }
  };

  const disabled = !agenciaId;
  const canSave  = !saving && !!usuario && !!empresa && !!sucursal && !!clave;

  return (
    <>
      <Tooltip title={disabled ? 'Falta id de agencia' : 'Ver / actualizar credenciales de Atlas'}>
        <span>
          <Button variant="outlined" size={size} onClick={handleOpen} disabled={disabled}>
            Credenciales Atlas
          </Button>
        </span>
      </Tooltip>

      <Dialog open={open} onClose={saving ? undefined : handleClose} maxWidth="xs" fullWidth>
        <DialogTitle>Credenciales de Atlas</DialogTitle>
        <DialogContent dividers>
          {loadingInit && <LinearProgress sx={{ mb: 2 }} />}

          <Stack spacing={2} sx={{ pt: 1 }}>
            {serverError && <Alert severity="error">{serverError}</Alert>}
            {okMsg && <Alert severity="success">{okMsg}</Alert>}

            <TextField
              label="Usuario"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              error={!!fieldErrors.atlas_usuario}
              helperText={fieldErrors.atlas_usuario?.[0] ?? ''}
              fullWidth
              autoFocus
              disabled={loadingInit}
            />
            <TextField
              label="Clave (se guarda encriptada)"
              type={showPass ? 'text' : 'password'}
              value={clave}
              onChange={(e) => setClave(e.target.value)}
              error={!!fieldErrors.atlas_clave}
              helperText={fieldErrors.atlas_clave?.[0] ?? 'Por seguridad no se prellena.'}
              fullWidth
              autoComplete="new-password"
              disabled={loadingInit}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPass((v) => !v)}
                      edge="end"
                      aria-label={showPass ? 'Ocultar clave' : 'Mostrar clave'}
                    >
                      {showPass ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Empresa"
              value={empresa}
              onChange={(e) => setEmpresa(e.target.value)}
              error={!!fieldErrors.atlas_empresa}
              helperText={fieldErrors.atlas_empresa?.[0] ?? ''}
              fullWidth
              disabled={loadingInit}
            />
            <TextField
              label="Sucursal"
              value={sucursal}
              onChange={(e) => setSucursal(e.target.value)}
              error={!!fieldErrors.atlas_sucursal}
              helperText={fieldErrors.atlas_sucursal?.[0] ?? ''}
              fullWidth
              disabled={loadingInit}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={saving}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={submit}
            disabled={!canSave}
            startIcon={saving ? <CircularProgress size={18} /> : null}
          >
            {saving ? 'Guardando…' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
