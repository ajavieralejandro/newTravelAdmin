'use client';

import * as React from 'react';
import {
  Grid,
  FormControl,
  InputLabel,
  OutlinedInput,
  Typography,
  FormControlLabel,
  Switch,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useFormContext, useWatch } from 'react-hook-form';

// Tipo correcto: viene del mapper
import type { AgenciaFormValues } from '@/contexts/features/Agencias/services/agenciaMapper';

export function DatosGeneralesSection(): JSX.Element {
  const { control, setValue } = useFormContext<AgenciaFormValues>();
  const [showPassword, setShowPassword] = React.useState(false);

  // ✅ Watch manteniendo snake_case en `name`, pero aliasando a camelCase
  const [
    nombre,
    dominio,
    estado,
    password,
    quienesSomosEs,
    quienesSomosEn,
    quienesSomosPt,
  ] = useWatch({
    control,
    name: [
      'nombre',
      'dominio',
      'estado',
      'password',
      'quienes_somos_es',
      'quienes_somos_en',
      'quienes_somos_pt',
    ],
  });

  // 🔍 Log snapshot
  React.useEffect(() => {
    console.groupCollapsed('[DatosGeneralesSection] values snapshot');
    console.info({
      nombre,
      dominio,
      estado,
      password: password ? '*** (oculta en UI)' : '',
      quienesSomosEs,
      quienesSomosEn,
      quienesSomosPt,
    });
    console.groupEnd();
  }, [
    nombre,
    dominio,
    estado,
    password,
    quienesSomosEs,
    quienesSomosEn,
    quienesSomosPt,
  ]);

  const onText =
    (name: keyof AgenciaFormValues) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setValue(name, e.target.value, { shouldDirty: true, shouldTouch: true });

  const onToggleEstado = (_: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    setValue('estado', checked, { shouldDirty: true, shouldTouch: true });
  };

  return (
    <>
      <Typography variant="h6">Datos generales</Typography>
      <Grid container spacing={3}>
        <Grid item md={6} xs={12}>
          <FormControl fullWidth>
            <InputLabel>Nombre</InputLabel>
            <OutlinedInput
              name="nombre"
              label="Nombre"
              value={nombre || ''}
              onChange={onText('nombre')}
            />
          </FormControl>
        </Grid>

        <Grid item md={6} xs={12}>
          <FormControl fullWidth>
            <InputLabel>Dominio</InputLabel>
            <OutlinedInput
              name="dominio"
              label="Dominio"
              value={dominio || ''}
              onChange={onText('dominio')}
            />
          </FormControl>
        </Grid>

        <Grid item md={6} xs={12}>
          <FormControl fullWidth>
            <InputLabel>Contraseña (opcional)</InputLabel>
            <OutlinedInput
              name="password"
              label="Contraseña (opcional)"
              type={showPassword ? 'text' : 'password'}
              value={password || ''}
              onChange={onText('password')}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="mostrar/ocultar contraseña"
                    onClick={() => setShowPassword((p) => !p)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
            />
          </FormControl>
        </Grid>

        <Grid item md={6} xs={12} sx={{ display: 'flex', alignItems: 'center' }}>
          <FormControlLabel
            control={
              <Switch
                checked={!!estado}
                onChange={onToggleEstado}
                color="primary"
              />
            }
            label="Agencia activa"
          />
        </Grid>

        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Quiénes somos (ES)</InputLabel>
            <OutlinedInput
              name="quienes_somos_es"
              label="Quiénes somos (ES)"
              value={quienesSomosEs || ''}
              onChange={onText('quienes_somos_es')}
              multiline
              minRows={3}
            />
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Quiénes somos (EN)</InputLabel>
            <OutlinedInput
              name="quienes_somos_en"
              label="Quiénes somos (EN)"
              value={quienesSomosEn || ''}
              onChange={onText('quienes_somos_en')}
              multiline
              minRows={3}
            />
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Quem somos (PT)</InputLabel>
            <OutlinedInput
              name="quienes_somos_pt"
              label="Quem somos (PT)"
              value={quienesSomosPt || ''}
              onChange={onText('quienes_somos_pt')}
              multiline
              minRows={3}
            />
          </FormControl>
        </Grid>
      </Grid>
    </>
  );
}
