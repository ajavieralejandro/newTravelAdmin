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

  return (
    <Stack spacing={3}>
      {/* Título */}
      <Stack spacing={1}>
        <Typography variant="h4">Configuración de Estilos</Typography>
        <Typography variant="body2" color="text.secondary">
          Ajustá paleta de colores, tipografías, logos, headers e imágenes destacadas del sitio de tu agencia.
        </Typography>
      </Stack>

      {errorMsg && <Alert severity="error">{errorMsg}</Alert>}
      {okMsg && <Alert severity="success">{okMsg}</Alert>}

      <Card variant="outlined">
        <CardHeader
          title="Estilos del sitio"
          subheader={
            idAgencia
              ? `Agencia #${idAgencia}`
              : 'Agencia no seleccionada (solo lectura)'
          }
        />
        <Divider />
        <CardContent>
          <Box sx={{ position: 'relative' }}>
            <StyledForm onSubmitPayload={handleSubmitEstilos} />

            {saving && (
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  bgcolor: 'rgba(255,255,255,0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 2,
                }}
              >
                <CircularProgress />
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>
    </Stack>
  );
}
