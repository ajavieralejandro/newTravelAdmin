// src/components/atlas/AtlasCredentialsButton.tsx
'use client';

import * as React from 'react';
import {
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
  Stack, Alert
} from '@mui/material';

type Props = {
  agenciaId?: number;
  initial?: { usuario?: string | null; empresa?: string | null; sucursal?: string | null; };
  onSaved?: (payload: { atlas_usuario: string; atlas_empresa: string; atlas_sucursal: string; }) => void;
  size?: 'small' | 'medium' | 'large';
  authToken?: string;
};

export default function AtlasCredentialsButton(_: Props) {
  const [open, setOpen] = React.useState(false);
  const [count, setCount] = React.useState(0);

  return (
    <>
      <Button variant="outlined" size="small" onClick={() => setOpen(true)}>
        Componente de prueba
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Health Check UI</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <Alert severity="success">Si ves esto, el componente renderiza OK.</Alert>
            <div style={{ fontFamily: 'monospace', fontSize: 12 }}>
              <div>Estado: <b>render estable</b></div>
              <div>Counter: {count}</div>
            </div>
            <Button variant="contained" onClick={() => setCount((c) => c + 1)}>
              Incrementar
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
