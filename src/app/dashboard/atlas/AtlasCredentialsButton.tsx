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
  initial?: { usuario?: string | null; empresa?: string | null; sucursal?: string | null };
  onSaved?: (payload: { atlas_usuario: string; atlas_empresa: string; atlas_sucursal: string }) => void;
  size?: 'small' | 'medium' | 'large';
  authToken?: string;
};

type ValidationErrors = Partial<
  Record<'atlas_usuario' | 'atlas_clave' | 'atlas_empresa' | 'atlas_sucursal', string[]>
>;

// ✅ Backend Laravel (API)
const API_BASE = 'https://travelconnect.com.ar';

// Evita dobles barras
const apiUrl = (path: string) =>
  `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;

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

  const [usuario, setUsuario] = React.useState(initial?.usuario ?? '');
  const [empresa, setEmpresa] = React.useState(initial?.empresa ?? '');
  const [sucursal, setSucursal] = React.useState(initial?.sucursal ?? '');
  const [clave, setClave] = React.useState('');

  React.useEffect(() => {
    if (!open) {
      setUsuario(initial?.usuario ?? '');
      setEmpresa(initial?.empresa ?? '');
      setSucursal(initial?.sucursal ?? '');
      setClave('');
    }
  }, [initial, open]);

  const commonHeaders: HeadersInit = {
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
  };

  // ✅ GET datos actuales
  const fetchCurrent = React.useCallback(async () => {
    if (!agenciaId) return;

    setLoadingInit(true);
    setServerError(null);

    try {
      const res = await fetch(
        apiUrl(`/api/atlas/agencias/${agenciaId}/credenciales`),
        {
          method: 'GET',
          headers: commonHeaders,
          credentials: 'include',
        }
      );

      const text = await res.text();
      const data = (() => {
        try { return JSON.parse(text); } catch { return null; }
      })();

      if (!res.ok) {
        setServerError(data?.error || `Error HTTP ${res.status}`);
      } else {
        setUsuario(data?.atlas_usuario ?? '');
        setEmpresa(data?.atlas_empresa ?? '');
        setSucursal(data?.atlas_sucursal ?? '');
        setClave('');
      }
    } catch (e: any) {
      setServerError(e?.message || 'Error de red');
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

  // ✅ PUT para guardar
  const submit = async () => {
    if (!agenciaId) return;

    setSaving(true);
    setServerError(null);
    setOkMsg(null);
    setFieldErrors({});

    try {
      const res = await fetch(
        apiUrl(`/api/atlas/agencias/${agenciaId}/credenciales`),
        {
          method: 'PUT',
          headers: { ...commonHeaders, 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            atlas_usuario: usuario,
            atlas_clave: clave,
            atlas_empresa: empresa,
            atlas_sucursal: sucursal,
          }),
        }
      );

      const text = await res.text();
      const data = (() => {
        try { return JSON.parse(text); } catch { return null; }
      })();

      if (!res.ok) {
        if (res.status === 422 && data?.details) {
          setFieldErrors(data.details);
        } else {
          setServerError(data?.error || `Error HTTP ${res.status}`);
        }
        setSaving(false);
        return;
      }

      setOkMsg('Credenciales actualizadas');
      onSaved?.({ atlas_usuario: usuario, atlas_empresa: empresa, atlas_sucursal: sucursal });

      setTimeout(() => setOpen(false), 900);
    } catch (e: any) {
      setServerError(e?.message || 'Error de red');
    } finally {
      setSaving(false);
    }
  };

  const disabled = !agenciaId;
  const canSave = !saving && usuario && empresa && sucursal && clave;

  return (
    <>
      <Tooltip title={disabled ? 'Falta id de agencia' : 'Ver / actualizar credenciales'}>
        <span>
          <Button variant="outlined" size={size} onClick={handleOpen} disabled={disabled}>
            Credenciales Atlas
          </Button>
        </span>
      </Tooltip>

      <Dialog open={open} onClose={!saving ? handleClose : undefined} maxWidth="xs" fullWidth>
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
            />

            <TextField
              label="Clave (se guarda encriptada)"
              type={showPass ? 'text' : 'password'}
              value={clave}
              onChange={(e) => setClave(e.target.value)}
              error={!!fieldErrors.atlas_clave}
              helperText={fieldErrors.atlas_clave?.[0] ?? 'Por seguridad no se prellena.'}
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPass(!showPass)}>
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
            />

            <TextField
              label="Sucursal"
              value={sucursal}
              onChange={(e) => setSucursal(e.target.value)}
              error={!!fieldErrors.atlas_sucursal}
              helperText={fieldErrors.atlas_sucursal?.[0] ?? ''}
              fullWidth
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
