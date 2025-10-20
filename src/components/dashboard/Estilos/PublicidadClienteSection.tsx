// components/dashboard/Estilos/sections/PublicidadClienteSection.tsx
'use client';

import * as React from 'react';
import { Box, FormControl, Grid, InputLabel, OutlinedInput, Switch, Typography } from '@mui/material';
import { useFormContext, useWatch } from 'react-hook-form';
// ✅ Tipo correcto desde el mapper
import type { AgenciaFormValues } from '@/contexts/features/Agencias/services/agenciaMapper';

export function PublicidadClienteSection(): JSX.Element {
  const { control, watch, setValue } = useFormContext<AgenciaFormValues>();

  // Claves (contrato snake_case, pero constantes camelCase-friendly)
  const kPublicidadExiste = 'publicidad_existe' as const;
  const kPublicidadTitulo = 'publicidad_titulo' as const;
  const kPublicidadTipografiaColor = 'publicidad_tipografia_color' as const;
  const kPublicidadColorPrimario = 'publicidad_color_primario' as const;
  const kPublicidadColorSecundario = 'publicidad_color_secundario' as const;
  const kPublicidadColorTerciario = 'publicidad_color_terciario' as const;

  // 🔍 Watch de todos los campos de la sección
  const [
    publicidadExiste,
    publicidadTitulo,
    publicidadTipografiaColor,
    publicidadColorPrimario,
    publicidadColorSecundario,
    publicidadColorTerciario,
  ] = useWatch({
    control,
    name: [
      kPublicidadExiste,
      kPublicidadTitulo,
      kPublicidadTipografiaColor,
      kPublicidadColorPrimario,
      kPublicidadColorSecundario,
      kPublicidadColorTerciario,
    ],
  });

  // 🔍 Log snapshot
  React.useEffect(() => {
    console.groupCollapsed('[PublicidadClienteSection] values snapshot');
    console.info({
      publicidadExiste,
      publicidadTitulo,
      publicidadTipografiaColor,
      publicidadColorPrimario,
      publicidadColorSecundario,
      publicidadColorTerciario,
    });
    console.groupEnd();
  }, [
    publicidadExiste,
    publicidadTitulo,
    publicidadTipografiaColor,
    publicidadColorPrimario,
    publicidadColorSecundario,
    publicidadColorTerciario,
  ]);

  const onText =
    (
      name:
        | typeof kPublicidadTitulo
        | typeof kPublicidadTipografiaColor
        | typeof kPublicidadColorPrimario
        | typeof kPublicidadColorSecundario
        | typeof kPublicidadColorTerciario
    ) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setValue(name, e.target.value, { shouldDirty: true, shouldTouch: true });

  const onColor =
    (
      name:
        | typeof kPublicidadTipografiaColor
        | typeof kPublicidadColorPrimario
        | typeof kPublicidadColorSecundario
        | typeof kPublicidadColorTerciario
    ) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setValue(name, e.target.value, { shouldDirty: true, shouldTouch: true });

  return (
    <>
      <Typography variant="h6">Publicidad Cliente</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="body2">¿Mostrar publicidad?</Typography>
          <Switch
            checked={!!publicidadExiste}
            onChange={(e) =>
              setValue(kPublicidadExiste, e.target.checked, { shouldDirty: true, shouldTouch: true })
            }
            color="primary"
          />
        </Grid>

        <Grid item md={6} xs={12}>
          <FormControl fullWidth>
            <InputLabel>Título de la Publicidad</InputLabel>
            <OutlinedInput
              name={kPublicidadTitulo}
              label="Título de la Publicidad"
              value={publicidadTitulo || ''}
              onChange={onText(kPublicidadTitulo)}
            />
          </FormControl>
        </Grid>

        <Grid item md={6} xs={12}>
          <Typography variant="body2">Color de Tipografía</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <input
              type="color"
              value={publicidadTipografiaColor || '#000000'}
              onChange={onColor(kPublicidadTipografiaColor)}
              style={{ width: 40, height: 40, borderRadius: '50%', border: 'none' }}
            />
            <OutlinedInput
              name={kPublicidadTipografiaColor}
              value={publicidadTipografiaColor || ''}
              onChange={onText(kPublicidadTipografiaColor)}
            />
          </Box>
        </Grid>

        <Grid item md={4} xs={12}>
          <Typography variant="body2">Color primario</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <input
              type="color"
              value={publicidadColorPrimario || '#000000'}
              onChange={onColor(kPublicidadColorPrimario)}
              style={{ width: 40, height: 40, borderRadius: '50%', border: 'none' }}
            />
            <OutlinedInput
              name={kPublicidadColorPrimario}
              value={publicidadColorPrimario || ''}
              onChange={onText(kPublicidadColorPrimario)}
            />
          </Box>
        </Grid>

        <Grid item md={4} xs={12}>
          <Typography variant="body2">Color secundario</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <input
              type="color"
              value={publicidadColorSecundario || '#000000'}
              onChange={onColor(kPublicidadColorSecundario)}
              style={{ width: 40, height: 40, borderRadius: '50%', border: 'none' }}
            />
            <OutlinedInput
              name={kPublicidadColorSecundario}
              value={publicidadColorSecundario || ''}
              onChange={onText(kPublicidadColorSecundario)}
            />
          </Box>
        </Grid>

        <Grid item md={4} xs={12}>
          <Typography variant="body2">Color terciario</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <input
              type="color"
              value={publicidadColorTerciario || '#000000'}
              onChange={onColor(kPublicidadColorTerciario)}
              style={{ width: 40, height: 40, borderRadius: '50%', border: 'none' }}
            />
            <OutlinedInput
              name={kPublicidadColorTerciario}
              value={publicidadColorTerciario || ''}
              onChange={onText(kPublicidadColorTerciario)}
            />
          </Box>
        </Grid>
      </Grid>
    </>
  );
}
