'use client';

import { useFormContext, Controller } from 'react-hook-form';
import { Box, Typography, Grid } from '@mui/material';
import InputFormulario from './InputFormulario';
import SelectorColorCampo from './SelectorCampoColor';

const StepTarjetas = () => {
  const { control, register } = useFormContext();

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
      {/* ======= Título y Tipografía ======= */}
      <Box component="section">
        <Typography variant="h6" component="h2" sx={{ mb: 3, fontWeight: 600 }}>
          Título y Tipografía
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <InputFormulario
              label="Título de la Sección de Tarjetas"
              {...register('tarjetas_titulo')}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Controller
              name="tarjetas_tipografia"
              control={control}
              render={({ field }) => (
                <InputFormulario
                  label="Tipografía"
                  esTipografia
                  name={field.name}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </Grid>
        </Grid>
      </Box>

      {/* ======= Colores de Tipografía ======= */}
      <Box component="section">
        <Typography variant="h6" component="h2" sx={{ mb: 3, fontWeight: 600 }}>
          Colores de Tipografía
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Controller
              name="tarjetas_tipografia_color"
              control={control}
              render={({ field }) => (
                <SelectorColorCampo label="Color del Texto" {...field} />
              )}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Controller
              name="tarjetas_tipografia_color_titulo"
              control={control}
              render={({ field }) => (
                <SelectorColorCampo label="Color del Título" {...field} />
              )}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Controller
              name="tarjetas_tipografia_color_contenido"
              control={control}
              render={({ field }) => (
                <SelectorColorCampo label="Color del Contenido" {...field} />
              )}
            />
          </Grid>
        </Grid>
      </Box>

      {/* ======= Paleta de Colores ======= */}
      <Box component="section">
        <Typography variant="h6" component="h2" sx={{ mb: 3, fontWeight: 600 }}>
          Paleta de Colores
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Controller
              name="tarjetas_color_primario"
              control={control}
              render={({ field }) => (
                <SelectorColorCampo label="Color Primario" {...field} />
              )}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Controller
              name="tarjetas_color_secundario"
              control={control}
              render={({ field }) => (
                <SelectorColorCampo label="Color Secundario" {...field} />
              )}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Controller
              name="tarjetas_color_terciario"
              control={control}
              render={({ field }) => (
                <SelectorColorCampo label="Color Terciario" {...field} />
              )}
            />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default StepTarjetas;
