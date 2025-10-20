// components/dashboard/Estilos/sections/TarjetasSection.tsx
'use client';

import * as React from 'react';
import {
  Box,
  FormControl,
  Grid,
  InputLabel,
  OutlinedInput,
  Typography,
} from '@mui/material';
import { useFormContext, useWatch } from 'react-hook-form';
// ✅ Tipo correcto desde el mapper
import type { AgenciaFormValues } from '@/contexts/features/Agencias/services/agenciaMapper';

export function TarjetasSection(): JSX.Element {
  const { control, setValue } = useFormContext<AgenciaFormValues>();

  // 🔍 useWatch con snake_case en name, camelCase en alias locales
  const [
    tarjetasTitulo,
    tarjetasTipografia,
    tarjetasTipografiaColor,
    tarjetasTipografiaColorTitulo,
    tarjetasTipografiaColorContenido,
    tarjetasColorPrimario,
    tarjetasColorSecundario,
    tarjetasColorTerciario,
  ] = useWatch({
    control,
    name: [
      'tarjetas_titulo',
      'tarjetas_tipografia',
      'tarjetas_tipografia_color',
      'tarjetas_tipografia_color_titulo',
      'tarjetas_tipografia_color_contenido',
      'tarjetas_color_primario',
      'tarjetas_color_secundario',
      'tarjetas_color_terciario',
    ],
  });

  // 🔍 Log snapshot
  React.useEffect(() => {
    console.groupCollapsed('[TarjetasSection] values snapshot');
    console.info({
      tarjetasTitulo,
      tarjetasTipografia,
      tarjetasTipografiaColor,
      tarjetasTipografiaColorTitulo,
      tarjetasTipografiaColorContenido,
      tarjetasColorPrimario,
      tarjetasColorSecundario,
      tarjetasColorTerciario,
    });
    console.groupEnd();
  }, [
    tarjetasTitulo,
    tarjetasTipografia,
    tarjetasTipografiaColor,
    tarjetasTipografiaColorTitulo,
    tarjetasTipografiaColorContenido,
    tarjetasColorPrimario,
    tarjetasColorSecundario,
    tarjetasColorTerciario,
  ]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target as { name: keyof AgenciaFormValues; value: string };
    setValue(name, value, { shouldDirty: true, shouldTouch: true });
  };

  const handleColor = (name: keyof AgenciaFormValues, value: string) => {
    setValue(name, value, { shouldDirty: true, shouldTouch: true });
  };

  return (
    <>
      <Typography variant="h6">Tarjetas</Typography>
      <Grid container spacing={3}>
        <Grid item md={6} xs={12}>
          <FormControl fullWidth>
            <InputLabel>Título</InputLabel>
            <OutlinedInput
              label="Título"
              name="tarjetas_titulo"
              value={tarjetasTitulo ?? ''}
              onChange={handleInput}
            />
          </FormControl>
        </Grid>

        <Grid item md={6} xs={12}>
          <FormControl fullWidth>
            <InputLabel>Tipografía</InputLabel>
            <OutlinedInput
              label="Tipografía"
              name="tarjetas_tipografia"
              value={tarjetasTipografia ?? ''}
              onChange={handleInput}
            />
          </FormControl>
        </Grid>

        {(
          [
            { key: 'tarjetas_tipografia_color', label: 'Color tipografía' },
            { key: 'tarjetas_tipografia_color_titulo', label: 'Color título' },
            { key: 'tarjetas_tipografia_color_contenido', label: 'Color contenido' },
          ] as const
        ).map(({ key, label }) => (
          <Grid item md={4} xs={12} key={key}>
            <Typography variant="body2">{label}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <input
                type="color"
                value={
                  key === 'tarjetas_tipografia_color'
                    ? tarjetasTipografiaColor ?? '#000000'
                    : key === 'tarjetas_tipografia_color_titulo'
                    ? tarjetasTipografiaColorTitulo ?? '#000000'
                    : tarjetasTipografiaColorContenido ?? '#000000'
                }
                onChange={(e) => handleColor(key, e.target.value)}
                style={{ width: 40, height: 40, borderRadius: '50%', border: 'none' }}
              />
              <OutlinedInput
                name={key}
                value={
                  key === 'tarjetas_tipografia_color'
                    ? tarjetasTipografiaColor ?? ''
                    : key === 'tarjetas_tipografia_color_titulo'
                    ? tarjetasTipografiaColorTitulo ?? ''
                    : tarjetasTipografiaColorContenido ?? ''
                }
                onChange={handleInput}
              />
            </Box>
          </Grid>
        ))}

        {(
          [
            { key: 'tarjetas_color_primario', label: 'Color primario' },
            { key: 'tarjetas_color_secundario', label: 'Color secundario' },
            { key: 'tarjetas_color_terciario', label: 'Color terciario' },
          ] as const
        ).map(({ key, label }) => (
          <Grid item md={4} xs={12} key={key}>
            <Typography variant="body2">{label}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <input
                type="color"
                value={
                  key === 'tarjetas_color_primario'
                    ? tarjetasColorPrimario ?? '#000000'
                    : key === 'tarjetas_color_secundario'
                    ? tarjetasColorSecundario ?? '#000000'
                    : tarjetasColorTerciario ?? '#000000'
                }
                onChange={(e) => handleColor(key, e.target.value)}
                style={{ width: 40, height: 40, borderRadius: '50%', border: 'none' }}
              />
              <OutlinedInput
                name={key}
                value={
                  key === 'tarjetas_color_primario'
                    ? tarjetasColorPrimario ?? ''
                    : key === 'tarjetas_color_secundario'
                    ? tarjetasColorSecundario ?? ''
                    : tarjetasColorTerciario ?? ''
                }
                onChange={handleInput}
              />
            </Box>
          </Grid>
        ))}
      </Grid>
    </>
  );
}
