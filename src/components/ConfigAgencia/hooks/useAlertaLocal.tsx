'use client';

import { useState, useEffect, useCallback } from 'react';
import { Alert, Collapse } from '@mui/material';
import type { AlertColor } from '@mui/material';
import type { JSX } from 'react';

type AlertaEstado = {
  open: boolean;
  mensaje: string;
  severidad: AlertColor; // 'success' | 'error' | 'info' | 'warning'
};

export const useAlertaLocal = (autoHideMs: number = 4000) => {
  const [alerta, setAlerta] = useState<AlertaEstado>({
    open: false,
    mensaje: '',
    severidad: 'info',
  });

  useEffect(() => {
    if (!alerta.open) return;
    const timer = setTimeout(() => {
      setAlerta((prev) => ({ ...prev, open: false }));
    }, autoHideMs);
    return () => clearTimeout(timer);
  }, [alerta.open, autoHideMs]);

  const cerrarAlerta = useCallback(() => {
    setAlerta((prev) => ({ ...prev, open: false }));
  }, []);

  const mostrarAlerta = useCallback(
    (mensaje: string, severidad: AlertColor = 'info') => {
      setAlerta({ open: true, mensaje, severidad });
    },
    []
  );

  const alertaJSX: JSX.Element = (
    <Collapse in={alerta.open} sx={{ width: '100%' }}>
      <Alert
        severity={alerta.severidad}
        onClose={cerrarAlerta}
        sx={{ mb: 2 }}
        variant="filled"
      >
        {alerta.mensaje}
      </Alert>
    </Collapse>
  );

  return {
    mostrarAlerta, // memoizada
    cerrarAlerta,  // opcional
    alertaJSX,
  };
};
