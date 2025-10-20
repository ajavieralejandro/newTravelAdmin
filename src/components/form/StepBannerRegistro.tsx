'use client';

import { useFormContext, Controller } from 'react-hook-form';
import { Box, Typography, Grid } from '@mui/material';
import InputFormulario from './InputFormulario';
import SelectorColorCampo from './SelectorCampoColor';

const StepBannerRegistro = () => {
  const { register, control } = useFormContext();

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
      {/* ======= Título del Banner ======= */}
      <Box component="section">
        <Typography variant="h6" component="h2" sx={{ mb: 3, fontWeight: 600 }}>
          Título del Banner de Registro
        </Typography>
        <InputFormulario
          label="Título"
          {...register('banner_registro_titulo')}
        />
      </Box>

      {/* ======= Colores del Banner ======= */}
      <Box component="section">
        <Typography variant="h6" component="h2" sx={{ mb: 3, fontWeight: 600 }}>
          Colores del Banner
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Controller
              name="banner_registro_tipografia_color"
              control={control}
              render={({ field }) => (
                <SelectorColorCampo
                  label="Color del Texto"
                  {...field}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name="banner_registro_color_primario"
              control={control}
              render={({ field }) => (
                <SelectorColorCampo
                  label="Color Primario"
                  {...field}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name="banner_registro_color_secundario"
              control={control}
              render={({ field }) => (
                <SelectorColorCampo
                  label="Color Secundario"
                  {...field}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name="banner_registro_color_terciario"
              control={control}
              render={({ field }) => (
                <SelectorColorCampo
                  label="Color Terciario"
                  {...field}
                />
              )}
            />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default StepBannerRegistro;
