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
  Chip,
} from '@mui/material';

import { useUserContext } from '@/contexts/user-context';

// Panel que lista TODAS las integraciones de API (Atlas, TGX, etc.)
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
        <Alert severity="warning" variant="outlined">
          No se pudo resolver el ID de la agencia. Revisá la sesión o recargá la página.
        </Alert>
      </Stack>
    );
  }

  const agenciaNombre =
    (agenciaRaw as any)?.nombre ||
    (agenciaRaw as any)?.name ||
    (user as any)?.agenciaNombre ||
    `Agencia #${idAgencia}`;

  return (
    <Stack spacing={3}>
      {/* Encabezado de página */}
      <Stack spacing={0.5}>
        <Typography variant="h4" fontWeight={600}>
          Integraciones
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Configurá las integraciones de tu agencia con proveedores externos de contenido y pagos:
          Atlas, TravelGateX, AllSeasons, <strong>Mercado Pago</strong>, entre otros.
        </Typography>
      </Stack>

      {/* Resumen de la agencia / contexto */}
      <Card variant="outlined">
        <CardContent>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            justifyContent="space-between"
          >
            <Stack spacing={0.3}>
              <Typography variant="subtitle2" color="text.secondary">
                Agencia actual
              </Typography>
              <Typography variant="h6">{agenciaNombre}</Typography>
              <Typography variant="body2" color="text.secondary">
                ID interno: <strong>#{idAgencia}</strong>
              </Typography>
            </Stack>

            <Stack
              direction="row"
              spacing={1}
              flexWrap="wrap"
              useFlexGap
            >
              <Chip size="small" label="Atlas" color="primary" variant="outlined" />
              <Chip size="small" label="TravelGateX" variant="outlined" />
              <Chip size="small" label="AllSeasons" variant="outlined" />
              <Chip size="small" label="Mercado Pago" color="secondary" variant="outlined" />
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* Panel principal de Integraciones de API (incluye Mercado Pago como una de las APIs) */}
      <Card variant="outlined">
        <CardHeader
          title="APIs conectadas"
          subheader="Gestioná credenciales, estados y configuración técnica de cada proveedor."
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
            {/* 
              Dentro de ApiIntegrationsPanel es donde deberías asegurar
              que exista también la sección / tarjeta para la API de Mercado Pago
              (credenciales, public_key, access_token, modo sandbox, etc.).
            */}
            <ApiIntegrationsPanel agenciaId={idAgencia} />
          </React.Suspense>
        </CardContent>
      </Card>
    </Stack>
  );
}
