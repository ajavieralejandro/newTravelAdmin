'use client';

import * as React from 'react';
import {
  Stack,
  Typography,
  Card,
  CardHeader,
  CardContent,
  Divider,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';

import { useUserContext } from '@/contexts/user-context';
import { agenciasService } from '@/contexts/features/Agencias/services/agenciasService';

// 🔹 Panel que lista TODAS las integraciones y permite toggles/acciones
import ApiIntegrationsPanel from './ApiIIntegrationsPanel';

function toNumber(x: unknown): number | undefined {
  if (x == null) return undefined;
  if (typeof x === 'number') return Number.isFinite(x) ? x : undefined;
  const n = parseInt(String(x).trim(), 10);
  return Number.isFinite(n) ? n : undefined;
}

export default function Page(): React.JSX.Element {
  const { user, agenciaRaw } = useUserContext();

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

  if (!idAgencia) {
    return (
      <Stack spacing={2}>
        <Typography variant="h4">Integraciones</Typography>
        <Alert severity="warning">
          No se pudo resolver el ID de la agencia. Revisá la sesión o recargá la página.
        </Alert>
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      {/* Título */}
      <Stack spacing={1}>
        <Typography variant="h4">Integraciones</Typography>
        <Typography variant="body2" color="text.secondary">
          Administrá las integraciones de tu agencia con proveedores externos (Atlas, TravelGateX,
          AllSeasons, etc.).
        </Typography>
      </Stack>

      {/* Panel de Integraciones de API */}
      <Card variant="outlined">
        <CardHeader
          title="APIs conectadas"
          subheader={`Agencia #${idAgencia}`}
        />
        <Divider />
        <CardContent>
          <React.Suspense
            fallback={
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            }
          >
            <ApiIntegrationsPanel agenciaId={idAgencia} />
          </React.Suspense>
        </CardContent>
      </Card>
    </Stack>
  );
}
