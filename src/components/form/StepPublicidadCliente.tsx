'use client';

import { useFormContext, Controller } from 'react-hook-form';
import {
  Box,
  Typography,
  Grid,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { useEffect } from 'react';
import InputFormulario from './InputFormulario';
import SelectorColorCampo from './SelectorCampoColor';
import BotonImportarArchivo from './ImportButton';
import { useAgenciaForm } from './hooks/useAgenciaForm';
import { usePrevisualizacionArchivo } from './hooks/usePrevisualizacionArchivo';

const StepPublicidadCliente = () => {
  const { register, watch, setValue, control } = useFormContext();
  const { urlsAgencia } = useAgenciaForm();

  const imagen1 = watch('publicidad_imagen_1');
  const imagen2 = watch('publicidad_imagen_2');
  const imagen3 = watch('publicidad_imagen_3');

  const preview1 = usePrevisualizacionArchivo({
    campo: 'publicidad_imagen_1',
    archivo: imagen1,
    urlOriginal: urlsAgencia?.publicidadUrls?.[0] ?? null,
    setValue,
  });

  const preview2 = usePrevisualizacionArchivo({
    campo: 'publicidad_imagen_2',
    archivo: imagen2,
    urlOriginal: urlsAgencia?.publicidadUrls?.[1] ?? null,
    setValue,
  });

  const preview3 = usePrevisualizacionArchivo({
    campo: 'publicidad_imagen_3',
    archivo: imagen3,
    urlOriginal: urlsAgencia?.publicidadUrls?.[2] ?? null,
    setValue,
  });

  // Forzar regeneración de previews si cambia el archivo
  useEffect(() => {}, [imagen1, imagen2, imagen3]);

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
      {/* ======= Activar Publicidad ======= */}
      <Box component="section">
        <FormControlLabel
          control={<Checkbox {...register('publicidad_existe')} />}
          label="Activar sección de publicidad"
        />
      </Box>

      {/* ======= Título y Color ======= */}
      <Box component="section">
        <Typography variant="h6" component="h2" sx={{ mb: 3, fontWeight: 600 }}>
          Título y Color de la Publicidad
        </Typography>

        <Grid container spacing={3} alignItems="flex-end">
          <Grid item xs={12} md={6}>
            <InputFormulario
              label="Título de la Publicidad"
              {...register('publicidad_titulo')}
            />
          </Grid>
          <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'flex-end' }}>
            <Controller
              name="publicidad_tipografia_color"
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
              name="publicidad_color_primario"
              control={control}
              render={({ field }) => (
                <SelectorColorCampo label="Color Primario" {...field} />
              )}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Controller
              name="publicidad_color_secundario"
              control={control}
              render={({ field }) => (
                <SelectorColorCampo label="Color Secundario" {...field} />
              )}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Controller
              name="publicidad_color_terciario"
              control={control}
              render={({ field }) => (
                <SelectorColorCampo label="Color Terciario" {...field} />
              )}
            />
          </Grid>
        </Grid>
      </Box>

      {/* ======= Imágenes de Publicidad ======= */}
      <Box component="section">
        <Typography variant="h6" component="h2" sx={{ mb: 3, fontWeight: 600 }}>
          Imágenes de Publicidad
        </Typography>

        <Grid container spacing={3}>
          {[preview1, preview2, preview3].map((preview, index) => (
            <Grid item xs={12} md={4} key={index}>
              <BotonImportarArchivo
                label={`Imagen ${index + 1} de Publicidad`}
                accept="image/*"
                multiple={false}
                onChange={preview.manejarCambio}
                register={register(`publicidad_imagen_${index + 1}`)}
              />
              {preview.urlPreview && (
                <Box
                  component="img"
                  src={preview.urlPreview}
                  alt={`Preview Imagen ${index + 1}`}
                  sx={{
                    width: '100%',
                    height: 140,
                    objectFit: 'cover',
                    border: '1px solid #ccc',
                    borderRadius: 2,
                    mt: 1,
                  }}
                />
              )}
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default StepPublicidadCliente;
