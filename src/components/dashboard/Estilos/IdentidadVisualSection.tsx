// components/dashboard/Estilos/sections/IdentidadVisualSection.tsx
'use client';

import * as React from 'react';
import { Box, FormControl, Grid, InputLabel, OutlinedInput, Typography } from '@mui/material';
import { useFormContext, useWatch } from 'react-hook-form';
// ✅ Tipo sale del mapper (no de forms.ts)
import type { AgenciaFormValues } from '@/contexts/features/Agencias/services/agenciaMapper';

export function IdentidadVisualSection(): JSX.Element {
  const { control, setValue } = useFormContext<AgenciaFormValues>();

  // 🔍 Watch: dejamos snake_case en names, variables locales camelCase
  const [tipografiaAgencia, colorTipografiaAgencia, colorFondoApp] = useWatch({
    control,
    name: ['tipografia_agencia', 'color_tipografia_agencia', 'color_fondo_app'],
  });

  // 🔍 Log snapshot
  React.useEffect(() => {
    console.groupCollapsed('[IdentidadVisualSection] values snapshot');
    console.info({
      tipografiaAgencia,
      colorTipografiaAgencia,
      colorFondoApp,
    });
    console.groupEnd();
  }, [tipografiaAgencia, colorTipografiaAgencia, colorFondoApp]);

  const onText =
    (name: keyof AgenciaFormValues) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setValue(name, e.target.value, { shouldDirty: true, shouldTouch: true });

  const onColor =
    (name: keyof AgenciaFormValues) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setValue(name, e.target.value, { shouldDirty: true, shouldTouch: true });

  return (
    <>
      <Typography variant="h6">Identidad Visual</Typography>
      <Grid container spacing={3}>
        <Grid item md={6} xs={12}>
          <FormControl fullWidth>
            <InputLabel>Tipografía de la Agencia</InputLabel>
            <OutlinedInput
              name="tipografia_agencia"
              label="Tipografía de la Agencia"
              value={tipografiaAgencia ?? ''}
              onChange={onText('tipografia_agencia')}
            />
          </FormControl>
        </Grid>

        <Grid item md={6} xs={12}>
          <Typography variant="body2">Color de Tipografía</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <input
              type="color"
              value={colorTipografiaAgencia ?? '#000000'}
              onChange={onColor('color_tipografia_agencia')}
              style={{ width: 40, height: 40, borderRadius: '50%', border: 'none' }}
            />
            <OutlinedInput
              name="color_tipografia_agencia"
              value={colorTipografiaAgencia ?? ''}
              onChange={onText('color_tipografia_agencia')}
            />
          </Box>
        </Grid>

        <Grid item md={6} xs={12}>
          <Typography variant="body2">Color de Fondo de la App</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <input
              type="color"
              value={colorFondoApp ?? '#ffffff'}
              onChange={onColor('color_fondo_app')}
              style={{ width: 40, height: 40, borderRadius: '50%', border: 'none' }}
            />
            <OutlinedInput
              name="color_fondo_app"
              value={colorFondoApp ?? ''}
              onChange={onText('color_fondo_app')}
            />
          </Box>
        </Grid>
      </Grid>
    </>
  );
}
