'use client';

import React from 'react';
import { Box, CircularProgress } from '@mui/material';

interface EstadoEnvioMensajeProps {
  status: 'idle' | 'loading' | 'success' | 'error';
  message?: string;
  modoEdicion?: boolean; // opcional: para adaptar textos según contexto
}

const EstadoEnvioMensaje: React.FC<EstadoEnvioMensajeProps> = ({ status, message, modoEdicion }) => {
  if (status === 'idle') return null;

  const backgroundColor =
    status === 'error'
      ? 'error.light'
      : status === 'success'
      ? 'success.light'
      : 'info.light';

  const textoPorDefecto = {
    loading: 'Procesando...',
    success: modoEdicion ? '¡Modificación exitosa!' : '¡Creación exitosa!',
    error: modoEdicion ? 'Error al modificar.' : 'Error al crear.',
  };

  return (
    <Box
      sx={{
        padding: 2,
        borderRadius: 1,
        backgroundColor,
        color: 'common.white',
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
      }}
    >
      {status === 'loading' && <CircularProgress size={20} color="inherit" />}
      {message || textoPorDefecto[status]}
    </Box>
  );
};

export default EstadoEnvioMensaje;

