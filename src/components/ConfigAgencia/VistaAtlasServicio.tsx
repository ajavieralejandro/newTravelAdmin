// src/components/ConfigAgencia/VistaAtlasServicio.tsx
'use client';

import {
  Box,
  Typography,
  Divider,
  TextField,
  Button,
  CircularProgress,
  Stack,
} from '@mui/material';
import { useMemo, useState } from 'react';
import { useUserContext } from '@/contexts/user-context';
import { useAlertaLocal } from './hooks/useAlertaLocal';
import {
  guardarCredencialesAtlas,
  type CredencialesAtlasPayload,
} from './credencialesAtlasService';

type Props = {
  /** ID de agencia (string|number). Se normaliza internamente a number para futuras llamadas. */
  agenciaId: string | number;
};

export function VistaAtlasServicio({ agenciaId }: Props): React.JSX.Element {
  const agenciaIdNum = useMemo(() => Number(agenciaId), [agenciaId]);
  const idValido = !Number.isNaN(agenciaIdNum);

  const { user } = useUserContext();
  const esSuperadmin = user?.rol === 'superadmin';

  const { mostrarAlerta, alertaJSX } = useAlertaLocal();

  const [guardando, setGuardando] = useState(false);
  const [form, setForm] = useState<CredencialesAtlasPayload>({
    atlas_usuario: '',
    atlas_clave: '',
    atlas_empresa: '',
    atlas_sucursal: '',
  });

  const onChange =
    (key: keyof CredencialesAtlasPayload) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const emailValido =
    form.atlas_usuario.trim().length > 0 &&
    // validación simple de email
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.atlas_usuario);

  const formValido =
    emailValido &&
    form.atlas_clave.trim().length > 0 &&
    form.atlas_empresa.trim().length > 0 &&
    form.atlas_sucursal.trim().length > 0;

  const onGuardar = async () => {
    if (!idValido || !esSuperadmin || !formValido) return;
    try {
      setGuardando(true);
      const res = await guardarCredencialesAtlas(agenciaIdNum, form);
      // No persistimos la clave en UI tras guardar
      setForm((prev) => ({
        ...prev,
        atlas_clave: '',
        // opcionalmente refrescamos con lo que vuelve
        atlas_usuario: res.agencia.atlas_usuario ?? prev.atlas_usuario,
        atlas_empresa: res.agencia.atlas_empresa ?? prev.atlas_empresa,
        atlas_sucursal: res.agencia.atlas_sucursal ?? prev.atlas_sucursal,
      }));
      mostrarAlerta(res.message || 'Credenciales de Atlas actualizadas correctamente', 'success');
    } catch (e: any) {
      mostrarAlerta(
        e?.message || 'No se pudo guardar las credenciales de Atlas. Intenta nuevamente.',
        'error'
      );
    } finally {
      setGuardando(false);
    }
  };

  if (!idValido) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="body2" color="error">
          ID de agencia inválido para CRM Atlas.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {alertaJSX}

      <Typography variant="h6">CRM Atlas — credenciales</Typography>
      <Typography variant="body2" sx={{ mt: 0.5 }} color="text.secondary">
        Agencia #{agenciaIdNum}
      </Typography>
      <Divider sx={{ my: 2 }} />

      <Stack spacing={2} sx={{ maxWidth: 640 }}>
        <TextField
          label="Usuario (email)"
          value={form.atlas_usuario}
          onChange={onChange('atlas_usuario')}
          fullWidth
          disabled={!esSuperadmin || guardando}
          error={form.atlas_usuario !== '' && !emailValido}
          helperText={
            form.atlas_usuario !== '' && !emailValido ? 'Ingresá un email válido.' : ' '
          }
        />
        <TextField
          label="Clave"
          type="password"
          value={form.atlas_clave}
          onChange={onChange('atlas_clave')}
          fullWidth
          disabled={!esSuperadmin || guardando}
        />
        <TextField
          label="Empresa"
          value={form.atlas_empresa}
          onChange={onChange('atlas_empresa')}
          fullWidth
          disabled={!esSuperadmin || guardando}
        />
        <TextField
          label="Sucursal"
          value={form.atlas_sucursal}
          onChange={onChange('atlas_sucursal')}
          fullWidth
          disabled={!esSuperadmin || guardando}
        />

        <Box>
          <Button
            variant="contained"
            onClick={onGuardar}
            disabled={!esSuperadmin || guardando || !formValido}
          >
            {guardando ? (
              <>
                Guardando&nbsp;
                <CircularProgress size={18} sx={{ ml: 1 }} />
              </>
            ) : (
              'Guardar'
            )}
          </Button>
          {!esSuperadmin && (
            <Typography variant="caption" sx={{ ml: 2 }} color="text.secondary">
              Solo los usuarios superadmin pueden modificar estas credenciales.
            </Typography>
          )}
        </Box>
      </Stack>
    </Box>
  );
}
