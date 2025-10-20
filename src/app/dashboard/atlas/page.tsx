// src/app/(tu-ruta)/AtlasPage.tsx
'use client';

import * as React from 'react';
import { Box, Tabs, Tab, Container, Typography } from '@mui/material';
import { AtlasPackagesTable } from './AtlasPackagesTable';
import { OpportunitiesTable } from './OpportunitiesTable';
import { useUserContext } from '@/contexts/user-context';
import type { AgenciaBackData } from '@/types/AgenciaBackData';

// ⬇️ importa el botón
import AtlasCredentialsButton from './AtlasCredentialsButton';

function toNumber(x: unknown): number | undefined {
  if (x == null) return undefined;
  if (typeof x === 'number') return Number.isFinite(x) ? x : undefined;
  const n = parseInt(String(x).trim(), 10);
  return Number.isFinite(n) ? n : undefined;
}

export default function AtlasPage(): React.JSX.Element {
  const [tab, setTab] = React.useState(0);
  const { agenciaRaw, agenciaView, user } = useUserContext();

  const handleChange = (_: React.SyntheticEvent, value: number) => setTab(value);

  // Logs útiles
  console.debug('[AtlasPage] agenciaRaw =', agenciaRaw);
  console.debug('[AtlasPage] agenciaView =', agenciaView);
  console.debug('[AtlasPage] user =', user);

  // ✅ Derivar id de agencia
  const idAgencia = React.useMemo<number | undefined>(() => {
    const candidates = [
      (agenciaRaw as any)?.idAgencia,
      (agenciaRaw as any)?.id,
      (agenciaRaw as any)?.agencia_id,
      (user as any)?.agenciaId,
      (user as any)?.agencia_id,
      (user as any)?.idAgencia,
      (agenciaView as any)?.id,
      (agenciaView as any)?.agencia_id,
      (agenciaView as any)?.idAgencia,
    ];
    for (const c of candidates) {
      const n = toNumber(c);
      if (n !== undefined) return n;
    }
    return undefined;
  }, [agenciaRaw, agenciaView, user]);

  // Prefills si los tenés en tu contexto (NO se expone la clave)
  const initialCreds = React.useMemo(() => ({
    usuario:  (agenciaView as any)?.atlas_usuario ?? (agenciaRaw as any)?.atlas_usuario ?? '',
    empresa:  (agenciaView as any)?.atlas_empresa ?? (agenciaRaw as any)?.atlas_empresa ?? '',
    sucursal: (agenciaView as any)?.atlas_sucursal ?? (agenciaRaw as any)?.atlas_sucursal ?? '',
  }), [agenciaRaw, agenciaView]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Encabezado con botón a la derecha */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        mb: 2,
      }}>
        <Typography variant="h5">Integraciones</Typography>

        <AtlasCredentialsButton
          agenciaId={idAgencia}
          initial={initialCreds}
          onSaved={() => {
            // si querés refrescar tablas o contexto, hacelo acá
            console.info('[AtlasPage] Credenciales guardadas');
          }}
        />
      </Box>

      <Tabs value={tab} onChange={handleChange} aria-label="tabs-integraciones" sx={{ mb: 3 }}>
        <Tab label="Paquetes Atlas" />
        <Tab label="Oportunidades" />
      </Tabs>

      <Box hidden={tab !== 0}>
        <AtlasPackagesTable idAgencia={idAgencia} />
      </Box>

      <Box hidden={tab !== 1}>
        <OpportunitiesTable agenciaId={idAgencia} />
      </Box>
    </Container>
  );
}
