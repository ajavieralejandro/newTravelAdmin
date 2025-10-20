'use client';

import React, { useRef } from 'react';
import { Button, Box } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

interface BotonImportarCSVProps {
  onImportar: (archivo: File) => void;
}

export const BotonImportarCSV: React.FC<BotonImportarCSVProps> = ({ onImportar }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleArchivoSeleccionado = (event: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = event.target.files?.[0];
    if (archivo) {
      onImportar(archivo);
    }
    event.target.value = '';
  };

  return (
    <Box>
      <Button
        variant="outlined"
        color="primary"
        startIcon={<CloudUploadIcon />}
        onClick={handleClick}
        sx={{ px: 4, py: 1.5, borderRadius: 2, textTransform: 'none' }}
      >
        Importar archivo
      </Button>

      <input
        type="file"
        accept=".csv"
        ref={fileInputRef}
        onChange={handleArchivoSeleccionado}
        style={{ display: 'none' }}
      />
    </Box>
  );
};
