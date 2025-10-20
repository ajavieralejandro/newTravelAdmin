// src/components/integrations/Page.tsx (o el archivo donde tengas este Page)
'use client';

import * as React from 'react';
import {
  Stack, Typography, Alert, Card, CardHeader, CardContent,
  Divider, CircularProgress, Box
} from '@mui/material';

import { StyledForm } from '@/components/dashboard/Estilos/StyledForm';
import { useUserContext } from '@/contexts/user-context';
import { agenciasService } from '@/contexts/features/Agencias/services/agenciasService';
import { mapFormToPayload } from '@/contexts/features/Agencias/services/agenciaMapper';

// ✅ Nuevo: panel que lista TODAS las integraciones y permite toggles/acciones
import ApiIntegrationsPanel from './ApiIIntegrationsPanel';

function toNumber(x: unknown): number | undefined {
  if (x == null) return undefined;
  if (typeof x === 'number') return Number.isFinite(x) ? x : undefined;
  const n = parseInt(String(x).trim(), 10);
  return Number.isFinite(n) ? n : undefined;
}

export default function Page(): React.JSX.Element {
  const { user, agenciaRaw, actualizarAgenciaLocal } = useUserContext();

  // 🔎 Resolver id de agencia de forma robusta
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
          Ajustá la apariencia del sitio de tu agencia y administrá las integraciones.
        </Typography>
      </Stack>

      {/* 🔧 Integraciones de la Agencia (NUEVO PANEL) */}
      <Card variant="outlined">
        <CardHeader
          title="Integraciones"
          subheader={idAgencia ? `Agencia #${idAgencia}` : 'Agencia no seleccionada (solo lectura)'}
        />
        <Divider />
        <CardContent>
          {/* Renderiza todas las APIs desde /apis y marca las activas de /api_agencias/{id}/apis */}
          <ApiIntegrationsPanel agenciaId={idAgencia} />
        </CardContent>
      </Card>

      {/* Formulario visual de estilos */}
      {errorMsg && <Alert severity="error">{errorMsg}</Alert>}
      {okMsg && <Alert severity="success">{okMsg}</Alert>}

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
    </Stack>
  );
}
