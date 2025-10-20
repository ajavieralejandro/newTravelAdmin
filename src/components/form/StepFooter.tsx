'use client';

import { useFormContext, Controller } from 'react-hook-form';
import { Box, Typography, Grid } from '@mui/material';
import InputFormulario from './InputFormulario';
import SelectorColorCampo from './SelectorCampoColor';

const StepFooter = () => {
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
      {/* ======= Texto y Tipografía ======= */}
      <Box component="section">
        <Typography variant="h6" component="h2" sx={{ mb: 3, fontWeight: 600 }}>
          Texto y Tipografía
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <InputFormulario
              label="Texto del Footer"
              {...register('footer_texto')}
            />
          </Grid>
        </Grid>

        <Grid container spacing={3} alignItems="flex-end">
          <Grid item xs={12} md={6}>
            <Controller
              name="footer_tipografia"
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
          </Grid>

          <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'flex-end' }}>
            <Controller
              name="footer_tipografia_color"
              control={control}
              render={({ field }) => (
                <SelectorColorCampo
                  label="Color de la Tipografía"
                  {...field}
                />
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
              name="footer_color_primario"
              control={control}
              render={({ field }) => (
                <SelectorColorCampo label="Color Primario" {...field} />
              )}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Controller
              name="footer_color_secundario"
              control={control}
              render={({ field }) => (
                <SelectorColorCampo label="Color Secundario" {...field} />
              )}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Controller
              name="footer_color_terciario"
              control={control}
              render={({ field }) => (
                <SelectorColorCampo label="Color Terciario" {...field} />
              )}
            />
          </Grid>
        </Grid>
      </Box>

      {/* ======= Redes Sociales ======= */}
      <Box component="section">
        <Typography variant="h6" component="h2" sx={{ mb: 3, fontWeight: 600 }}>
          Redes Sociales
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <InputFormulario label="Facebook" {...register('footer_facebook')} />
          </Grid>
          <Grid item xs={12} md={6}>
            <InputFormulario label="Twitter" {...register('footer_twitter')} />
          </Grid>
          <Grid item xs={12} md={6}>
            <InputFormulario label="Instagram" {...register('footer_instagram')} />
          </Grid>
          <Grid item xs={12} md={6}>
            <InputFormulario label="WhatsApp" {...register('footer_whatsapp')} />
          </Grid>
        </Grid>
      </Box>

      {/* ======= Contacto y Ubicación ======= */}
      <Box component="section">
        <Typography variant="h6" component="h2" sx={{ mb: 3, fontWeight: 600 }}>
          Contacto y Ubicación
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <InputFormulario label="Teléfono" {...register('footer_telefono')} />
          </Grid>
          <Grid item xs={12} md={6}>
            <InputFormulario label="Email" {...register('footer_email')} />
          </Grid>
          <Grid item xs={12} md={6}>
            <InputFormulario label="Dirección" {...register('footer_direccion')} />
          </Grid>
          <Grid item xs={12} md={6}>
            <InputFormulario label="Ciudad" {...register('footer_ciudad')} />
          </Grid>
          <Grid item xs={12} md={6}>
            <InputFormulario label="País" {...register('footer_pais')} />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default StepFooter;
