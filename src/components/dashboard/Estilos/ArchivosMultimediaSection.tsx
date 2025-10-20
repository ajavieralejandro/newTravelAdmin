// components/dashboard/Estilos/ArchivosMultimediaSection.tsx
'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { Box, Grid, Typography, Button } from '@mui/material';
import { useFormContext } from 'react-hook-form';
// ✅ Tipo correcto: mapper UI-ready
import type { AgenciaFormValues } from '@/contexts/features/Agencias/services/agenciaMapper';

type AnyVal = File | string | null | undefined;

/** Hook de compatibilidad: elige el primer nombre de campo que exista en el form (para LECTURA). */
function useCompatField(candidates: string[]) {
  const { getValues, watch } = useFormContext<AgenciaFormValues>();
  const [name, setName] = useState<string>(candidates[0]);

  useEffect(() => {
    for (const c of candidates) {
      // @ts-expect-error lectura dinámica
      const v = getValues(c);
      if (v !== undefined) {
        setName(c);
        return;
      }
    }
    // Si ninguno existe, dejamos el primero (el deseado/canónico)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // @ts-expect-error watch dinámico
  const value: AnyVal = watch(name);
  return { name, value };
}

export function ArchivosMultimediaSection(): JSX.Element {
  const { setValue } = useFormContext<AgenciaFormValues>();

  // 🔎 Compat de LECTURA (canónica primero)
  const logoF         = useCompatField(['logo', 'logoUrl']);
  const headerImagenF = useCompatField(['header_imagen_background', 'headerImagen', 'header_imagen', 'headerImagenUrl']);
  const headerVideoF  = useCompatField(['header_video_background', 'headerVideo', 'header_video', 'headerVideoUrl']);
  const terminosF     = useCompatField(['terminos_y_condiciones', 'terminosUrl']);
  const publicidad1F  = useCompatField(['publicidad_imagen_1', 'publicidadImagen1', 'publicidad_1', 'publicidadUrls.0']);
  const publicidad2F  = useCompatField(['publicidad_imagen_2', 'publicidadImagen2', 'publicidad_2', 'publicidadUrls.1']);
  const publicidad3F  = useCompatField(['publicidad_imagen_3', 'publicidadImagen3', 'publicidad_3', 'publicidadUrls.2']);

  // 🔍 Log snapshot (compacto, sin inundar con File completos)
  React.useEffect(() => {
    const brief = (val: AnyVal) =>
      val instanceof File
        ? { kind: 'File', name: val.name, size: val.size }
        : val
        ? { kind: 'string', value: String(val) }
        : null;

    console.groupCollapsed('[ArchivosMultimediaSection] values snapshot');
    console.info({
      logo:         { readKey: logoF.name,         value: brief(logoF.value) },
      headerImagen: { readKey: headerImagenF.name, value: brief(headerImagenF.value) },
      headerVideo:  { readKey: headerVideoF.name,  value: brief(headerVideoF.value) },
      terminos:     { readKey: terminosF.name,     value: brief(terminosF.value) },
      publicidad1:  { readKey: publicidad1F.name,  value: brief(publicidad1F.value) },
      publicidad2:  { readKey: publicidad2F.name,  value: brief(publicidad2F.value) },
      publicidad3:  { readKey: publicidad3F.name,  value: brief(publicidad3F.value) },
    });
    console.groupEnd();
  }, [
    logoF.name, logoF.value,
    headerImagenF.name, headerImagenF.value,
    headerVideoF.name, headerVideoF.value,
    terminosF.name, terminosF.value,
    publicidad1F.name, publicidad1F.value,
    publicidad2F.name, publicidad2F.value,
    publicidad3F.name, publicidad3F.value,
  ]);

  const getPreviewUrl = (val: AnyVal): string | null => {
    if (!val) return null;
    return typeof val === 'string' ? val : URL.createObjectURL(val);
  };

  const renderInputArchivo = (
    label: string,
    canonicalField: keyof AgenciaFormValues, // ← SIEMPRE escribimos a la clave canónica
    currentForPreview: AnyVal,
    accept: string
  ) => {
    const url = getPreviewUrl(currentForPreview);

    const nombreArchivo = (): string => {
      if (!currentForPreview) return 'Ningún archivo seleccionado';
      if (currentForPreview instanceof File) return `Nuevo archivo: ${currentForPreview.name}`;
      return 'Archivo existente';
    };

    const preview = (): React.ReactNode => {
      if (!url) return null;
      const lower = url.toLowerCase();

      if (/\.(?:jpg|jpeg|png|webp|gif|svg|ico)$/.test(lower)) {
        return <img src={url} alt={label} style={{ maxHeight: 60, borderRadius: 4 }} />;
      }
      if (/\.(?:mp4|webm|ogg)$/.test(lower)) {
        return <video src={url} style={{ maxHeight: 80 }} controls muted />;
      }
      if (/\.(?:pdf|txt|doc|docx)$/.test(lower)) {
        return (
          <Typography variant="caption" color="text.secondary">
            Archivo disponible: <a href={url} target="_blank" rel="noopener noreferrer">ver</a>
          </Typography>
        );
      }
      return (
        <Typography variant="caption" color="text.secondary">
          Archivo: <a href={url} target="_blank" rel="noopener noreferrer">ver</a>
        </Typography>
      );
    };

    return (
      <Grid item md={6} xs={12} key={String(canonicalField)}>
        <Typography variant="body2">{label}</Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <Button component="label" variant="outlined" color="primary">
            Seleccionar archivo
            <input
              hidden
              type="file"
              accept={accept}
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                // ✅ ESCRITURA SIEMPRE EN CLAVE CANÓNICA
                setValue(canonicalField as any, file, { shouldDirty: true, shouldTouch: true });
              }}
            />
          </Button>

          <Button
            variant="text"
            color="inherit"
            size="small"
            onClick={() => {
              // ✅ Quitar → null en clave canónica
              setValue(canonicalField as any, null, { shouldDirty: true, shouldTouch: true });
            }}
          >
            Quitar
          </Button>

          <Typography variant="caption">{nombreArchivo()}</Typography>
          {preview()}
        </Box>
      </Grid>
    );
  };

  return (
    <>
      <Typography variant="h6">Archivos multimedia</Typography>
      <Grid container spacing={3}>
        {/* ✅ Escriben SIEMPRE en claves de AgenciaPayload */}
        {renderInputArchivo('Logo',               'logo',                     logoF.value,         'image/*')}
        {renderInputArchivo('Imagen de header',   'header_imagen_background', headerImagenF.value, 'image/*')}
        {renderInputArchivo('Video de header',    'header_video_background',  headerVideoF.value,  'video/*')}
        {renderInputArchivo('Términos y Condiciones', 'terminos_y_condiciones', terminosF.value,   'application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain')}
        {renderInputArchivo('Publicidad 1',       'publicidad_imagen_1',      publicidad1F.value, 'image/*')}
        {renderInputArchivo('Publicidad 2',       'publicidad_imagen_2',      publicidad2F.value, 'image/*')}
        {renderInputArchivo('Publicidad 3',       'publicidad_imagen_3',      publicidad3F.value, 'image/*')}
      </Grid>
    </>
  );
}
