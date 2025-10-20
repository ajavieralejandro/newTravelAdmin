// src/app/dashboard/servicios/TablaAgenciasApis.tsx
'use client';

import {
  Box,
  CircularProgress,
  Collapse,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { CaretDown, CaretRight } from '@phosphor-icons/react';
import { Fragment, useState } from 'react';

import { useAgenciasContext } from '@/contexts/features/Agencias/AgenciaProvider';
import { VistaApisServicio } from '@/components/ConfigAgencia/VistaApisServicio';
import type { AgenciaBackData } from '@/types/AgenciaBackData';

export function TablaAgenciasApis(): React.JSX.Element {
  const {
    state: { agencias, loading, error },
  } = useAgenciasContext();

  const [openId, setOpenId] = useState<string | null>(null);

  const toggleRow = (id: string | null) => {
    setOpenId(openId === id ? null : id);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Typography color="error">Error: {error}</Typography>
      </Box>
    );
  }

  if (!agencias || agencias.length === 0) {
    return (
      <Box p={3}>
        <Typography>No hay agencias disponibles</Typography>
      </Box>
    );
  }

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Agencia</TableCell>
          <TableCell>Dominio</TableCell>
          <TableCell>Estado</TableCell>
          <TableCell>APIs</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {agencias.map((agencia: AgenciaBackData) => {
          const isOpen = openId === agencia.idAgencia;
          return (
            <Fragment key={agencia.idAgencia}>
              <TableRow>
                <TableCell>
                  <Typography variant="subtitle2">{agencia.nombre}</Typography>
                </TableCell>
                <TableCell>{agencia.dominio}</TableCell>
                <TableCell>
                  <Box
                    component="span"
                    sx={{
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      backgroundColor: agencia.estado ? 'success.light' : 'error.light',
                      color: agencia.estado ? 'success.dark' : 'error.dark',
                    }}
                  >
                    {agencia.estado ? 'Activa' : 'Inactiva'}
                  </Box>
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => toggleRow(agencia.idAgencia)}
                    aria-label={isOpen ? 'Contraer APIs' : 'Expandir APIs'}
                  >
                    {isOpen ? <CaretDown /> : <CaretRight />}
                  </IconButton>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={4} sx={{ py: 0 }}>
                  <Collapse in={isOpen} timeout="auto" unmountOnExit>
                    <Box p={2}>
                      <VistaApisServicio agenciaId={agencia.idAgencia} />
                    </Box>
                  </Collapse>
                </TableCell>
              </TableRow>
            </Fragment>
          );
        })}
      </TableBody>
    </Table>
  );
}
