'use client';

import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Tooltip,
} from '@mui/material';
import { PencilSimple, Trash, CopySimple } from '@phosphor-icons/react';

import { usePaquetesPropios } from '@/contexts/features/PaquetesPropiosProvider/usePaquetesPropios';
import type { PaquetePropio } from '@/types/PaquetePropio';

interface SubtablaPaquetesProps {
  agenciaId: string;   // ✅ camelCase en front
  nombreAgencia: string;
}

export function SubtablaPaquetes({ agenciaId, nombreAgencia }: SubtablaPaquetesProps) {
  const {
    paquetesPorAgencia,
    eliminarPaquete,
    seleccionarPaquete,
    abrirModalCreacion,              // <- setea idAgenciaEnCreacion en el contexto
    seleccionarPaqueteParaSalidas,
    prepararDuplicadoPaquete,
  } = usePaquetesPropios();

  const loading = paquetesPorAgencia[agenciaId] === undefined;
  const paquetes = paquetesPorAgencia[agenciaId] || [];

  const handleCrearNuevo = () => {
    console.log('🟢 Click en crear paquete (agenciaId:', agenciaId, ')');
    abrirModalCreacion(agenciaId);   // ✅ inyecta el id de la agencia en el flujo
  };

  const handleEditar = (paquete: PaquetePropio) => {
    console.log('🟠 Editar paquete:', paquete);
    seleccionarPaquete(paquete);
  };

  const handleEliminar = async (id: number) => {
    const confirm = window.confirm('¿Estás seguro de eliminar este paquete?');
    if (confirm) {
      await eliminarPaquete(id);
    }
  };

  const handleVerSalidas = (paquete: PaquetePropio) => {
    console.log('🔵 Ver salidas del paquete', paquete.id, 'de agencia', agenciaId);
    seleccionarPaqueteParaSalidas(paquete, agenciaId);
  };

  const handleDuplicar = (paquete: PaquetePropio) => {
    console.log('🟣 Duplicar paquete:', paquete, 'para agencia', agenciaId);
    prepararDuplicadoPaquete(paquete, agenciaId);
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">
          Paquetes propios de <strong>{nombreAgencia}</strong>
        </Typography>
        <Button variant="contained" onClick={handleCrearNuevo} disabled={!agenciaId}>
          + Crear paquete propio
        </Button>
      </Stack>

      {loading ? (
        <Box display="flex" justifyContent="center" py={3}>
          <CircularProgress size={32} />
        </Box>
      ) : paquetes.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No hay paquetes propios registrados para esta agencia.
        </Typography>
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Título</TableCell>
              <TableCell>Ciudad</TableCell>
              <TableCell>País</TableCell>
              <TableCell>Desde</TableCell>
              <TableCell>Hasta</TableCell>
              <TableCell>Noches</TableCell>
              <TableCell>Moneda</TableCell>
              <TableCell>Salidas</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paquetes.map((paquete) => (
              <TableRow key={paquete.id} hover>
                <TableCell>{paquete.titulo}</TableCell>
                <TableCell>{paquete.ciudad}</TableCell>
                <TableCell>{paquete.pais}</TableCell>
                <TableCell>{paquete.fecha_vigencia_desde}</TableCell>
                <TableCell>{paquete.fecha_vigencia_hasta}</TableCell>
                <TableCell>{paquete.cant_noches}</TableCell>
                <TableCell>{paquete.tipo_moneda}</TableCell>
                <TableCell>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleVerSalidas(paquete)}
                  >
                    Ver salidas ({paquete.salidas.length})
                  </Button>
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Editar">
                    <IconButton onClick={() => handleEditar(paquete)}>
                      <PencilSimple size={20} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Duplicar">
                    <IconButton onClick={() => handleDuplicar(paquete)}>
                      <CopySimple size={20} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Eliminar">
                    <IconButton onClick={() => handleEliminar(paquete.id)}>
                      <Trash size={20} />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Box>
  );
}
