'use client';

import { useFormContext, Controller } from 'react-hook-form';
import { Box, Typography, Grid } from '@mui/material';
import InputFormulario from './InputFormulario';
import SelectorColorCampo from './SelectorCampoColor';

const StepDatosGenerales = () => {
  const { control } = useFormContext();

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
      {/* ======= Tipografía de la Agencia ======= */}
      <Box component="section">
        <Typography variant="h6" component="h2" sx={{ mb: 3, fontWeight: 600 }}>
          Tipografía de la Agencia
        </Typography>

        <Grid container spacing={3} alignItems="flex-end">
          <Grid item xs={12} md={6}>
            <Controller
              name="tipografia_agencia"
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
              name="color_tipografia_agencia"
              control={control}
              render={({ field }) => (
                <SelectorColorCampo
                  label="Color de la Tipografía"
                  descripcion="Color principal del texto en la aplicación"
                  {...field}
                />
              )}
            />
          </Grid>
        </Grid>
      </Box>

      {/* ======= Colores Base ======= */}
      <Box component="section">
        <Typography variant="h6" component="h2" sx={{ mb: 3, fontWeight: 600 }}>
          Colores Base de la Aplicación
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Controller
              name="color_fondo_app"
              control={control}
              render={({ field }) => (
                <SelectorColorCampo
                  label="Color de Fondo de la App"
                  descripcion="Color general de fondo de toda la aplicación"
                  {...field}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name="color_principal"
              control={control}
              render={({ field }) => (
                <SelectorColorCampo
                  label="Color Principal"
                  descripcion="Color utilizado para elementos principales"
                  {...field}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name="color_secundario"
              control={control}
              render={({ field }) => (
                <SelectorColorCampo
                  label="Color Secundario"
                  descripcion="Color para elementos secundarios y destacados"
                  {...field}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name="color_terciario"
              control={control}
              render={({ field }) => (
                <SelectorColorCampo
                  label="Color Terciario"
                  descripcion="Color adicional para acentos u otros elementos"
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

export default StepDatosGenerales;
