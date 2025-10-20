'use client';

import React from 'react';
import { Button } from '@mui/material';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';

interface BotonExportarCSVProps {
  onExportar: () => void;
}

export const BotonExportarCSV: React.FC<BotonExportarCSVProps> = ({ onExportar }) => {
  return (
    <Button
      variant="contained"
      color="primary"
      startIcon={<CloudDownloadIcon />}
      onClick={onExportar}
      sx={{ px: 4, py: 1.5, borderRadius: 2, textTransform: 'none' }}
    >
      Exportar archivo
    </Button>
  );
};
