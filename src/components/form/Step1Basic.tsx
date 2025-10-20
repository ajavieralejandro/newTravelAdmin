'use client';

import { useFormContext, Controller } from 'react-hook-form';
import {
  Box,
  Typography,
  Grid,
  Divider,
  Checkbox,
  FormControlLabel,
  Link,
  Alert,
  Chip,
  Stack,
} from '@mui/material';
import { useMemo, useEffect, useState } from 'react';

import InputFormulario from './InputFormulario';
import BotonImportarArchivo from './ImportButton';
import { usePrevisualizacionArchivo } from './hooks/usePrevisualizacionArchivo';
import { useModalAgenciaGlobal } from '@/contexts/ModalAgenciaProvider';

const getFileNameFromPath = (p?: string): string => {
  if (!p) return '';
  const clean = p.split('?')[0];
  const parts = clean.split('/');
  return parts[parts.length - 1] || clean;
};

const toAbsoluteUrl = (url?: string): string => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  const base = 'https://travelconnect.com.ar';
  return `${base}/${url.replace(/^\/+/, '')}`;
};

const Step1Basic = () => {
  const { control, register, watch, setValue } = useFormContext();
  const { datosEdicion } = useModalAgenciaGlobal();

  const logoFile = watch('logo');
  const estado = watch('estado');
  const dominio = watch('dominio');

  // Campo de términos y condiciones
  const terminosValor = watch('terminos_y_condiciones');

  console.log('[Step1Basic] Estado desde RHF:', estado);

  const logoPreview = usePrevisualizacionArchivo({
    campo: 'logo',
    archivo: logoFile instanceof File ? logoFile : null,
    urlOriginal: typeof datosEdicion?.logo === 'string' ? datosEdicion.logo : null,
    setValue,
  });

  // onChange: normaliza FileList -> File | null
  const handleTerminosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setValue('terminos_y_condiciones', file, { shouldDirty: true, shouldTouch: true });
  };

  // URL para "Ver documento" (File -> objectURL, backend string -> absoluta)
  const [terminosUrlVer, setTerminosUrlVer] = useState<string | null>(null);
  useEffect(() => {
    // Si el usuario seleccionó un archivo nuevo
    if (terminosValor instanceof File) {
      const obj = URL.createObjectURL(terminosValor);
      setTerminosUrlVer(obj);
      return () => URL.revokeObjectURL(obj);
    }

    // Si viene del backend como string (ruta/URL)
    const raw =
      typeof datosEdicion?.terminos_y_condiciones === 'string'
        ? datosEdicion.terminos_y_condiciones
        : '';

    // Sanitizar valores inválidos tipo "{}"
    if (raw && raw !== '{}' && raw.trim() !== '') {
      setTerminosUrlVer(toAbsoluteUrl(raw));
    } else {
      setTerminosUrlVer(null);
    }
    return;
  }, [terminosValor, datosEdicion?.terminos_y_condiciones]);

  // Determinar el nombre a mostrar para Términos y Condiciones
  const terminosNombreParaMostrar = useMemo(() => {
    const v = terminosValor as unknown;
    // Si es File directamente
    if (v instanceof File) return v.name;
    // Si es FileList
    if (v && typeof v === 'object' && 'length' in (v as FileList)) {
      const first = (v as FileList)[0];
      if (first) return first.name;
    }
    // Si viene del backend como string (ruta o URL)
    const backVal =
      typeof datosEdicion?.terminos_y_condiciones === 'string'
        ? datosEdicion.terminos_y_condiciones
        : null;
    if (backVal && backVal !== '{}' && backVal.trim() !== '') {
      return getFileNameFromPath(backVal);
    }
    // Nada cargado
    return '';
  }, [terminosValor, datosEdicion?.terminos_y_condiciones]);

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
      {/* ======= Información Básica ======= */}
      <Box component="section">
        <Typography variant="h6" component="h2" sx={{ mb: 3, fontWeight: 600 }}>
          Información Básica
        </Typography>

        <Controller
          name="estado"
          control={control}
          render={({ field }) => (
            <FormControlLabel
              control={
                <Checkbox
                  {...field}
                  checked={!!field.value} // Asegura que sea booleano
                  color="primary"
                />
              }
              label="Activar agencia"
            />
          )}
        />

        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <InputFormulario label="Nombre" {...register('nombre')} />
          </Grid>
          <Grid item xs={12} md={6}>
            <InputFormulario
              label="Contraseña"
              type="password"
              {...register('password')}
            />
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ mb: 2 }}>
              <InputFormulario 
                label="Dominio" 
                placeholder="tunombre"
                helperText="Solo ingresa el nombre, sin espacios ni caracteres especiales"
                {...register('dominio')} 
              />
              
              {/* Preview del dominio completo */}
              {dominio && (
                <Box sx={{ mt: 2 }}>
                  <Alert 
                    severity="info" 
                    sx={{ 
                      bgcolor: 'primary.50',
                      border: '1px solid',
                      borderColor: 'primary.200',
                      '& .MuiAlert-icon': {
                        color: 'primary.main'
                      }
                    }}
                  >
                    <Stack spacing={1}>
                      <Typography variant="body2" fontWeight={600}>
                        Tu sitio web será creado en:
                      </Typography>
                      <Chip
                        label={`${dominio}.travelconnect.com.ar`}
                        color="primary"
                        variant="outlined"
                        sx={{
                          fontFamily: 'monospace',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          alignSelf: 'flex-start',
                          bgcolor: 'background.paper',
                          '&:hover': {
                            bgcolor: 'primary.50'
                          }
                        }}
                      />
                    </Stack>
                  </Alert>
                </Box>
              )}
              
              {/* Explicación adicional */}
              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.4 }}>
                  💡 <strong>Ejemplo:</strong> Si ingresas "miagencia", tu sitio será: <code>miagencia.travelconnect.com.ar</code>
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* ======= Quiénes Somos ======= */}
      <Box component="section">
        <Typography variant="h6" component="h2" sx={{ mb: 3, fontWeight: 600 }}>
          Quiénes Somos
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <InputFormulario
              label="Español"
              multiline
              minRows={4}
              {...register('quienes_somos_es')}
            />
          </Grid>
          <Grid item xs={12}>
            <InputFormulario
              label="Inglés"
              multiline
              minRows={4}
              {...register('quienes_somos_en')}
            />
          </Grid>
          <Grid item xs={12}>
            <InputFormulario
              label="Portugués"
              multiline
              minRows={4}
              {...register('quienes_somos_pt')}
            />
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* ======= Archivos ======= */}
      <Box component="section">
        <Typography variant="h6" component="h2" sx={{ mb: 3, fontWeight: 600 }}>
          Archivos
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <BotonImportarArchivo
              label="Importar Logo"
              accept="image/*"
              multiple={false}
              onChange={logoPreview.manejarCambio}
              register={register('logo')}
            />
            {logoPreview.urlPreview && (
              <Box
                component="img"
                src={logoPreview.urlPreview}
                alt="Logo"
                sx={{
                  width: 100,
                  height: 100,
                  objectFit: 'contain',
                  border: '1px solid #ccc',
                  borderRadius: 2,
                  mb: 2,
                }}
              />
            )}
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* ======= Documentos Legales ======= */}
      <Box component="section">
        <Typography variant="h6" component="h2" sx={{ mb: 3, fontWeight: 600 }}>
          Documentos Legales
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <BotonImportarArchivo
              label="Términos y Condiciones"
              accept=".pdf,.doc,.docx"
              multiple={false}
              onChange={handleTerminosChange}
              register={register('terminos_y_condiciones')}
            />
            <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
              {terminosNombreParaMostrar
                ? `Archivo: ${terminosNombreParaMostrar}`
                : 'Aún no se ha subido archivo.'}
            </Typography>
            {terminosUrlVer && (
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                <Link href={terminosUrlVer} target="_blank" rel="noopener noreferrer">
                  Ver documento
                </Link>
              </Typography>
            )}
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Step1Basic;
