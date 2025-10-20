// components/dashboard/Estilos/sections/PaletaColoresSection.tsx
'use client';

import * as React from 'react';
import { Box, Grid, OutlinedInput, Typography } from '@mui/material';
import { useFormContext, useWatch } from 'react-hook-form';
// ✅ Tipo correcto desde el mapper
import type { AgenciaFormValues } from '@/contexts/features/Agencias/services/agenciaMapper';

interface ColorInputProps {
  label: string;
  name: keyof AgenciaFormValues;
  value: string | null | undefined;
  onText: (name: keyof AgenciaFormValues) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  onColor: (name: keyof AgenciaFormValues) => (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function ColorInput({ label, name, value, onText, onColor }: ColorInputProps) {
  return (
    <Grid item md={4} xs={12}>
      <Typography variant="body2">{label}</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <input
          type="color"
          value={value ?? '#000000'}
          onChange={onColor(name)}
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            border: 'none',
            cursor: 'pointer',
          }}
        />
        <OutlinedInput
          name={name}
          value={value ?? ''}
          onChange={onText(name)}
          placeholder="#000000"
        />
      </Box>
    </Grid>
  );
}

export function PaletaColoresSection(): JSX.Element {
  const { control, setValue } = useFormContext<AgenciaFormValues>();

  // 🔍 useWatch: names en snake_case, variables locales en camelCase
  const [colorPrincipal, colorSecundario, colorTerciario] = useWatch({
    control,
    name: ['color_principal', 'color_secundario', 'color_terciario'],
  });

  // 🔍 Log snapshot
  React.useEffect(() => {
    console.groupCollapsed('[PaletaColoresSection] values snapshot');
    console.info({ colorPrincipal, colorSecundario, colorTerciario });
    console.groupEnd();
  }, [colorPrincipal, colorSecundario, colorTerciario]);

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
      <Typography variant="h6">Paleta de Colores</Typography>
      <Grid container spacing={3}>
        <ColorInput
          label="Color Principal"
          name="color_principal"
          value={colorPrincipal}
          onText={onText}
          onColor={onColor}
        />
        <ColorInput
          label="Color Secundario"
          name="color_secundario"
          value={colorSecundario}
          onText={onText}
          onColor={onColor}
        />
        <ColorInput
          label="Color Terciario"
          name="color_terciario"
          value={colorTerciario}
          onText={onText}
          onColor={onColor}
        />
      </Grid>
    </>
  );
}
