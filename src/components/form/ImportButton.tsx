// src/components/form/BotonImportarArchivo.tsx
'use client';

import { Box, Button, IconButton, Stack, Typography } from '@mui/material';
import UploadIcon from '@mui/icons-material/Upload';
import DeleteIcon from '@mui/icons-material/Delete';
import ImageIcon from '@mui/icons-material/Image';
import { forwardRef, useRef } from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';

interface BotonImportarArchivoProps {
  label: string;
  accept?: string;
  multiple?: boolean;
  register?: UseFormRegisterReturn;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  urlPreview?: string | null;
  onClearPreview?: () => void;
  disabled?: boolean;
}

const BotonImportarArchivo = forwardRef<HTMLInputElement, BotonImportarArchivoProps>(
  (
    {
      label,
      accept,
      multiple = false,
      register,
      onChange,
      urlPreview,
      onClearPreview,
      disabled,
      ...props
    },
    ref
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleClick = () => {
      if (!disabled) inputRef.current?.click();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // 1) Notificar primero a RHF
      register?.onChange(e);
      // 2) Luego tu normalización (setValue con files[0], etc.)
      onChange?.(e);
    };

    // Compose refs (local + forwardRef + RHF)
    const setRefs = (element: HTMLInputElement | null) => {
      (inputRef as React.MutableRefObject<HTMLInputElement | null>).current = element;

      if (typeof ref === 'function') ref(element);
      else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = element;

      register?.ref(element);
    };

    const handleClearPreview = () => {
      if (inputRef.current) inputRef.current.value = '';
      onClearPreview?.();
      // Si necesitás reflejar el “clear” en RHF, hacelo con setValue desde el caller.
    };

    return (
      <Box sx={{ mb: 4 }}>
        <input
          type="file"
          hidden
          multiple={multiple}
          accept={accept}
          ref={setRefs}
          name={register?.name}       // ✅ necesario para RHF
          onBlur={register?.onBlur}   // ✅ propagar onBlur de RHF
          onChange={handleChange}
          disabled={disabled}
          {...props}
        />

        <Stack direction="row" alignItems="center" spacing={2}>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<UploadIcon fontSize="medium" />}
            onClick={handleClick}
            disabled={disabled}
          >
            {label}
          </Button>

          {urlPreview && (
            <Stack direction="row" alignItems="center" spacing={1}>
              <ImageIcon />
              <Typography variant="body2" sx={{ maxWidth: 200 }} noWrap>
                Vista previa
              </Typography>
              <IconButton onClick={handleClearPreview} aria-label="Eliminar vista previa">
                <DeleteIcon />
              </IconButton>
            </Stack>
          )}
        </Stack>

        {urlPreview && (
          <Box
            component="img"
            src={urlPreview}
            alt="Vista previa"
            sx={{
              mt: 2,
              maxWidth: 250,
              maxHeight: 150,
              borderRadius: 2,
              boxShadow: 1,
            }}
          />
        )}
      </Box>
    );
  }
);

BotonImportarArchivo.displayName = 'BotonImportarArchivo';

export default BotonImportarArchivo;
