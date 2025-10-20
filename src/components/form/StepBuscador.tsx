'use client';

import { useFormContext, Controller } from 'react-hook-form';
import { useEffect } from 'react';
import { Box, Typography, Grid } from '@mui/material';
import InputFormulario from './InputFormulario';
import SelectorColorCampo from './SelectorCampoColor';

const StepBuscador = () => {
  const { control, watch } = useFormContext();

  const tipografiaBuscador = watch('buscador_tipografia');

  useEffect(() => {
    console.log('🔍 Tipografía del Buscador:', tipografiaBuscador);
  }, [tipografiaBuscador]);

  return (
    <Box
      sx={{
        py: 4,
        px: { xs: 2, sm: 3, md: 4 },
        '& section': {
          mb: 6,
        },
      }}
    >
      {/* ======= Tipografía del Buscador ======= */}
      <Box component="section">
        <Typography variant="h6" component="h2" sx={{ mb: 3, fontWeight: 600 }}>
          Tipografía del Buscador
        </Typography>
        <Controller
          name="buscador_tipografia"
          control={control}
          render={({ field }) => (
            <InputFormulario
              label="Tipografía"
              esTipografia
              value={field.value}
              onChange={field.onChange}
              name={field.name}
            />
          )}
        />
      </Box>

      {/* ======= Colores de Texto ======= */}
      <Box component="section">
        <Typography variant="h6" component="h2" sx={{ mb: 3, fontWeight: 600 }}>
          Colores de Texto
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Controller
              name="buscador_tipografia_color"
              control={control}
              render={({ field }) => (
                <SelectorColorCampo label="Color del Texto" {...field} />
              )}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Controller
              name="buscador_tipografia_color_label"
              control={control}
              render={({ field }) => (
                <SelectorColorCampo label="Color de las Etiquetas" {...field} />
              )}
            />
          </Grid>
        </Grid>
      </Box>

      {/* ======= Paleta del Buscador ======= */}
      <Box component="section">
        <Typography variant="h6" component="h2" sx={{ mb: 3, fontWeight: 600 }}>
          Paleta de Colores del Buscador
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Controller
              name="buscador_color_primario"
              control={control}
              render={({ field }) => (
                <SelectorColorCampo label="Color Primario del Buscador" {...field} />
              )}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Controller
              name="buscador_color_secundario"
              control={control}
              render={({ field }) => (
                <SelectorColorCampo label="Color Secundario del Buscador" {...field} />
              )}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Controller
              name="buscador_color_terciario"
              control={control}
              render={({ field }) => (
                <SelectorColorCampo label="Color Terciario del Buscador" {...field} />
              )}
            />
          </Grid>
        </Grid>
      </Box>

      {/* ======= Colores del Input ======= */}
      <Box component="section">
        <Typography variant="h6" component="h2" sx={{ mb: 3, fontWeight: 600 }}>
          Colores del Input
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Controller
              name="buscador_inputColor"
              control={control}
              render={({ field }) => (
                <SelectorColorCampo label="Color del Input" {...field} />
              )}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Controller
              name="buscador_inputFondoColor"
              control={control}
              render={({ field }) => (
                <SelectorColorCampo label="Fondo del Input" {...field} />
              )}
            />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default StepBuscador;
