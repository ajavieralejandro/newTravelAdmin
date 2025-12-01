'use client';

import * as React from 'react';
import {
  Stack,
  Typography,
  Alert,
  Card,
  CardHeader,
  CardContent,
  Divider,
  Box,
  CircularProgress,
  Chip,
} from '@mui/material';

import { StyledForm } from '@/components/dashboard/Estilos/StyledForm';
import { useUserContext } from '@/contexts/user-context';
import { agenciasService } from '@/contexts/features/Agencias/services/agenciasService';
import { mapFormToPayload } from '@/contexts/features/Agencias/services/agenciaMapper';

function toNumber(x: unknown): number | undefined {
  if (x == null) return undefined;
  if (typeof x === 'number') return Number.isFinite(x) ? x : undefined;
  const n = parseInt(String(x).trim(), 10);
  return Number.isFinite(n) ? n : undefined;
}

export default function Page(): React.JSX.Element {
  const { user, agenciaRaw, actualizarAgenciaLocal } = useUserContext();

  const idAgencia = React.useMemo<number | undefined>(() => {
    const candidates = [
      (user as any)?.agencia_id,
      (user as any)?.agenciaId,
      (user as any)?.idAgencia,
      (agenciaRaw as any)?.idAgencia,
      (agenciaRaw as any)?.agencia_id,
      (agenciaRaw as any)?.id,
    ];
    for (const c of candidates) {
      const n = toNumber(c);
      if (n !== undefined) return n;
    }
    return undefined;
  }, [user, agenciaRaw]);

  const [saving, setSaving] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [okMsg, setOkMsg] = React.useState<string | null>(null);

  const handleSubmitEstilos = React.useCallback(
    async (payloadUnknown: unknown) => {
      const payload = payloadUnknown as ReturnType<typeof mapFormToPayload>;

      if (!idAgencia) {
        setErrorMsg('No se pudo resolver el ID de la agencia.');
        return;
      }

      setSaving(true);
      setErrorMsg(null);
      setOkMsg(null);

      try {
        const back = await agenciasService.update(String(idAgencia), payload);
        await actualizarAgenciaLocal(back);
        setOkMsg('Estilos guardados correctamente.');
      } catch (e: any) {
        setErrorMsg(e?.message || 'Error al guardar estilos.');
      } finally {
        setSaving(false);
      }
    },
    [idAgencia, actualizarAgenciaLocal]
  );

  const hasAgencia = Boolean(idAgencia);

  return (
    <Stack spacing={3}>
      {/* Header principal */}
      <Stack spacing={0.5}>
        <Typography
          component="p"
          variant="overline"
          sx={{
            letterSpacing: '.18em',
            textTransform: 'uppercase',
            color: 'text.secondary',
          }}
        >
          Panel · Branding
        </Typography>

        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
            }}
          >
            Configuración de estilos
          </Typography>

          <Chip
            size="small"
            label={
              hasAgencia
                ? `Agencia vinculada #${idAgencia}`
                : 'Agencia no seleccionada'
            }
            color={hasAgencia ? 'success' : 'warning'}
            variant={hasAgencia ? 'filled' : 'outlined'}
          />
        </Stack>

        <Typography variant="body2" color="text.secondary">
          Ajustá paleta de colores, tipografías, logos, headers e imágenes destacadas
          del sitio público de tu agencia.
        </Typography>
      </Stack>

      {/* Mensajes de estado */}
      <Stack spacing={1}>
        {errorMsg && <Alert severity="error">{errorMsg}</Alert>}
        {okMsg && <Alert severity="success">{okMsg}</Alert>}

        {!hasAgencia && (
          <Alert severity="info" variant="outlined">
            No se detectó una agencia asociada al usuario actual. Podés revisar la
            información de la cuenta o seleccionar una agencia desde el panel de
            administración para aplicar estos estilos.
          </Alert>
        )}
      </Stack>

      {/* Card principal */}
      <Card
        variant="outlined"
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
        }}
      >
        <CardHeader
          title={
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="h6" component="span">
                Estilos del sitio
              </Typography>
              <Chip
                size="small"
                label={saving ? 'Guardando…' : 'Edición local'}
                color={saving ? 'info' : 'default'}
                variant="outlined"
              />
            </Stack>
          }
          subheader={
            hasAgencia
              ? 'Los cambios se aplican al front público de esta agencia.'
              : 'Vista de solo lectura hasta que se vincule una agencia.'
          }
        />
        <Divider />

        <CardContent>
          <Box
            sx={{
              position: 'relative',
              pt: 1,
            }}
          >
            <StyledForm onSubmitPayload={handleSubmitEstilos} />

            {saving && (
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark'
                      ? 'rgba(15,23,42,0.6)'
                      : 'rgba(255,255,255,0.6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 2,
                  backdropFilter: 'blur(2px)',
                  zIndex: 10,
                }}
              >
                <Stack alignItems="center" spacing={1}>
                  <CircularProgress size={26} />
                  <Typography variant="caption" color="text.secondary">
                    Guardando estilos…
                  </Typography>
                </Stack>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>
    </Stack>
  );
}
