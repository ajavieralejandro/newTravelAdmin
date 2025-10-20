// components/dashboard/Estilos/sections/BuscadorSection.tsx
'use client';

import * as React from 'react';
import { Box, FormControl, Grid, InputLabel, OutlinedInput, Typography } from '@mui/material';
import { useFormContext, useWatch } from 'react-hook-form';
// ✅ Tipo correcto desde el mapper
import type { AgenciaFormValues } from '@/contexts/features/Agencias/services/agenciaMapper';

/** Input combinado de color + texto (definido FUERA del render) */
interface ColorInputProps {
  label: string;
  name: keyof AgenciaFormValues;
  value: string | null | undefined;
  defaultColor?: string;
  onText: (name: keyof AgenciaFormValues) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  onColor: (name: keyof AgenciaFormValues) => (e: React.ChangeEvent<HTMLInputElement>) => void;
}
function ColorInput({
  label,
  name,
  value,
  defaultColor = '#000000',
  onText,
  onColor,
}: ColorInputProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <input
        type="color"
        value={value ?? defaultColor}
        onChange={onColor(name)}
        style={{ width: 40, height: 40, borderRadius: '50%', border: 'none' }}
      />
      <OutlinedInput name={name} value={value ?? ''} onChange={onText(name)} />
    </Box>
  );
}

export function BuscadorSection(): JSX.Element {
  const { control, setValue } = useFormContext<AgenciaFormValues>();

  // 🔍 Watch de todos los campos de la sección
  const [
    buscadorInputColor,
    buscadorInputFondoColor,
    buscadorTipografia,
    buscadorTipografiaColor,
    buscadorTipografiaColorLabel,
    buscadorColorPrimario,
    buscadorColorSecundario,
    buscadorColorTerciario,
  ] = useWatch({
    control,
    name: [
      'buscador_inputColor',          // camelCase en tu AgenciaFormValues
      'buscador_inputFondoColor',     // camelCase en tu AgenciaFormValues
      'buscador_tipografia',
      'buscador_tipografia_color',
      'buscador_tipografia_color_label',
      'buscador_color_primario',
      'buscador_color_secundario',
      'buscador_color_terciario',
    ],
  });

  // 🔍 Log snapshot
  React.useEffect(() => {
    console.groupCollapsed('[BuscadorSection] values snapshot');
    console.info({
      buscadorInputColor,
      buscadorInputFondoColor,
      buscadorTipografia,
      buscadorTipografiaColor,
      buscadorTipografiaColorLabel,
      buscadorColorPrimario,
      buscadorColorSecundario,
      buscadorColorTerciario,
    });
    console.groupEnd();
  }, [
    buscadorInputColor,
    buscadorInputFondoColor,
    buscadorTipografia,
    buscadorTipografiaColor,
    buscadorTipografiaColorLabel,
    buscadorColorPrimario,
    buscadorColorSecundario,
    buscadorColorTerciario,
  ]);

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
      <Typography variant="h6">Buscador</Typography>
      <Grid container spacing={3}>
        <Grid item md={6} xs={12}>
          <FormControl fullWidth>
            <InputLabel>Tipografía</InputLabel>
            <OutlinedInput
              name="buscador_tipografia"
              label="Tipografía"
              value={buscadorTipografia ?? ''}
              onChange={onText('buscador_tipografia')}
            />
          </FormControl>
        </Grid>

        <Grid item md={6} xs={12}>
          <Typography variant="body2">Color de Tipografía</Typography>
          <ColorInput
            label="Color de Tipografía"
            name="buscador_tipografia_color"
            value={buscadorTipografiaColor}
            onText={onText}
            onColor={onColor}
          />
        </Grid>

        <Grid item md={6} xs={12}>
          <Typography variant="body2">Color del Label</Typography>
          <ColorInput
            label="Color del Label"
            name="buscador_tipografia_color_label"
            value={buscadorTipografiaColorLabel}
            onText={onText}
            onColor={onColor}
          />
        </Grid>

        <Grid item md={6} xs={12}>
          <Typography variant="body2">Color de Fondo del Input</Typography>
          <ColorInput
            label="Color de Fondo del Input"
            name="buscador_inputFondoColor"   // ← camelCase según tu contrato
            value={buscadorInputFondoColor}
            defaultColor="#ffffff"
            onText={onText}
            onColor={onColor}
          />
        </Grid>

        <Grid item md={6} xs={12}>
          <Typography variant="body2">Color del Input</Typography>
          <ColorInput
            label="Color del Input"
            name="buscador_inputColor"        // ← camelCase según tu contrato
            value={buscadorInputColor}
            onText={onText}
            onColor={onColor}
          />
        </Grid>

        <Grid item md={4} xs={12}>
          <Typography variant="body2">Color primario</Typography>
          <ColorInput
            label="Color primario"
            name="buscador_color_primario"
            value={buscadorColorPrimario}
            onText={onText}
            onColor={onColor}
          />
        </Grid>

        <Grid item md={4} xs={12}>
          <Typography variant="body2">Color secundario</Typography>
          <ColorInput
            label="Color secundario"
            name="buscador_color_secundario"
            value={buscadorColorSecundario}
            onText={onText}
            onColor={onColor}
          />
        </Grid>

        <Grid item md={4} xs={12}>
          <Typography variant="body2">Color terciario</Typography>
          <ColorInput
            label="Color terciario"
            name="buscador_color_terciario"
            value={buscadorColorTerciario}
            onText={onText}
            onColor={onColor}
          />
        </Grid>
      </Grid>
    </>
  );
}
