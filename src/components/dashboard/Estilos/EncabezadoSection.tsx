// components/dashboard/Estilos/sections/EncabezadoSection.tsx
'use client';

import * as React from 'react';
import { Grid, Typography } from '@mui/material';
import { useFormContext, useWatch } from 'react-hook-form';
// ✅ Tipo correcto desde el mapper
import type { AgenciaFormValues } from '@/contexts/features/Agencias/services/agenciaMapper';

export function EncabezadoSection(): JSX.Element {
  const { control, setValue } = useFormContext<AgenciaFormValues>();

  // 🔍 Watch: names snake_case, variables camelCase
  const [headerImagenOpacity, headerVideoOpacity] = useWatch({
    control,
    name: ['header_imagen_background_opacidad', 'header_video_background_opacidad'],
  });

  // 🔍 Log snapshot
  React.useEffect(() => {
    console.groupCollapsed('[EncabezadoSection] values snapshot');
    console.info({
      headerImagenOpacity,
      headerVideoOpacity,
    });
    console.groupEnd();
  }, [headerImagenOpacity, headerVideoOpacity]);

  const onRange =
    (name: keyof AgenciaFormValues) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const num = parseFloat(e.target.value);
      // clamp 0..1 por seguridad
      const clamped = Number.isFinite(num) ? Math.min(1, Math.max(0, num)) : 0;
      setValue(name, clamped, { shouldDirty: true, shouldTouch: true });
    };

  return (
    <>
      <Typography variant="h6">Encabezado (Header)</Typography>
      <Grid container spacing={3}>
        <Grid item md={6} xs={12}>
          <Typography variant="body2">Opacidad de la Imagen</Typography>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={headerImagenOpacity ?? 0}
            onChange={onRange('header_imagen_background_opacidad')}
            style={{ width: '100%' }}
          />
          <Typography variant="caption">
            {(headerImagenOpacity ?? 0).toFixed(2)}
          </Typography>
        </Grid>

        <Grid item md={6} xs={12}>
          <Typography variant="body2">Opacidad del Video</Typography>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={headerVideoOpacity ?? 0}
            onChange={onRange('header_video_background_opacidad')}
            style={{ width: '100%' }}
          />
          <Typography variant="caption">
            {(headerVideoOpacity ?? 0).toFixed(2)}
          </Typography>
        </Grid>
      </Grid>
    </>
  );
}
