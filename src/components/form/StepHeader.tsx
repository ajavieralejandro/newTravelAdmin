'use client';

import { useFormContext } from 'react-hook-form';
import { Box, Typography } from '@mui/material';
import InputFormulario from './InputFormulario';
import BotonImportarArchivo from './ImportButton';
import { usePrevisualizacionArchivo } from './hooks/usePrevisualizacionArchivo';
import { useModalAgenciaGlobal } from '@/contexts/ModalAgenciaProvider';

const StepHeader = () => {
  const { register, watch, setValue } = useFormContext();
  const { datosEdicion } = useModalAgenciaGlobal();

  const imagenHeader = usePrevisualizacionArchivo({
    campo: 'header_imagen_background',
    archivo: watch('header_imagen_background'),
    urlOriginal: datosEdicion?.header_imagen_background ?? null,
    setValue,
  });

  const videoHeader = usePrevisualizacionArchivo({
    campo: 'header_video_background',
    archivo: watch('header_video_background'),
    urlOriginal: datosEdicion?.header_video_background ?? null,
    setValue,
  });

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
      {/* ======= Imagen de fondo ======= */}
      <Box component="section">
        <Typography variant="h6" component="h2" sx={{ mb: 3, fontWeight: 600 }}>
          Imagen de Fondo del Header
        </Typography>

        {imagenHeader.urlPreview && typeof imagenHeader.urlPreview === 'string' && (
          <Box
            component="img"
            src={imagenHeader.urlPreview}
            alt="Preview Imagen Header"
            sx={{
              width: '100%',
              maxHeight: 200,
              objectFit: 'contain',
              mb: 2,
              borderRadius: 2,
              border: '1px solid #ccc',
            }}
          />
        )}

        <BotonImportarArchivo
          label="Importar Imagen de Fondo del Header"
          accept="image/*"
          multiple={false}
          onChange={imagenHeader.manejarCambio}
          register={register('header_imagen_background')}
        />

        <InputFormulario
          label="Opacidad de la Imagen (0-100)"
          type="number"
          inputProps={{ min: 0, max: 100 }}
          {...register('header_imagen_background_opacidad')}
        />
      </Box>

      {/* ======= Video de fondo ======= */}
      <Box component="section">
        <Typography variant="h6" component="h2" sx={{ mb: 3, fontWeight: 600 }}>
          Video de Fondo del Header
        </Typography>

        {videoHeader.urlPreview && typeof videoHeader.urlPreview === 'string' && (
          <Box
            component="video"
            src={videoHeader.urlPreview}
            controls
            sx={{
              width: '100%',
              maxHeight: 200,
              objectFit: 'contain',
              mb: 2,
              borderRadius: 2,
              border: '1px solid #ccc',
            }}
          />
        )}

        <BotonImportarArchivo
          label="Importar Video de Fondo del Header"
          accept="video/*"
          multiple={false}
          onChange={videoHeader.manejarCambio}
          register={register('header_video_background')}
        />

        <InputFormulario
          label="Opacidad del Video (0-100)"
          type="number"
          inputProps={{ min: 0, max: 100 }}
          {...register('header_video_background_opacidad')}
        />
      </Box>
    </Box>
  );
};

export default StepHeader;
