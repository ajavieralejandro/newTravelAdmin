'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Typography,
  Box,
  Collapse,
  Stack,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  PencilSimple,
  Trash,
  CaretDown,
  CaretRight,
  CopySimple,
} from '@phosphor-icons/react';
import { Fragment, useState } from 'react';

import { usePaquetesPropios } from '@/contexts/features/PaquetesPropiosProvider/usePaquetesPropios';
import { Salida } from '@/types/Salidas';
import ModalSalidaEditor from './ModalSalidaEditor';
import {
  crearSalida,
  editarSalida,
  eliminarSalida,
} from '@/components/paquetesPropios/salidasService';

export default function ModalSalidas() {
  const {
    paqueteActivoParaSalidas,
    limpiarPaqueteParaSalidas,
    fetchPaquetesDeAgencia,
    idAgenciaEnCreacion,
    setSalidaADuplicar,
    setSalidaSeleccionada,
  } = usePaquetesPropios();

  const [expandida, setExpandida] = useState<number | null>(null);
  const [modalEditorAbierto, setModalEditorAbierto] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [snackbarAbierto, setSnackbarAbierto] = useState(false);
  const [snackbarMensaje, setSnackbarMensaje] = useState('');
  const [snackbarTipo, setSnackbarTipo] = useState<'success' | 'error'>('success');

  // 👇 NUEVO: modo duplicado
  const [modoDuplicado, setModoDuplicado] = useState(false);

  const handleClose = () => {
    limpiarPaqueteParaSalidas();
    setExpandida(null);
  };

  const handleCrear = () => {
    setSalidaSeleccionada(null);
    setSalidaADuplicar(null);
    setModoDuplicado(false); // creación normal
    setModalEditorAbierto(true);
  };

  const handleEditar = (salida: Salida) => {
    setSalidaSeleccionada(salida);
    setSalidaADuplicar(null);
    setModoDuplicado(false); // edición
    setModalEditorAbierto(true);
  };

  const handleDuplicar = (salida: Salida) => {
    setSalidaSeleccionada(null);
    setSalidaADuplicar(salida);
    setModoDuplicado(true); // 👈 duplicado → forzar CREAR
    setModalEditorAbierto(true);
  };

  const handleEliminar = async (salidaId: number) => {
    if (!confirm('¿Estás seguro de que querés eliminar esta salida?')) return;

    setLoadingSubmit(true);
    try {
      await eliminarSalida(salidaId);
      setSnackbarTipo('success');
      setSnackbarMensaje('Salida eliminada correctamente');
      setSnackbarAbierto(true);

      if (idAgenciaEnCreacion) {
        await fetchPaquetesDeAgencia(idAgenciaEnCreacion);
      }
    } catch (error) {
      console.error('❌ Error al eliminar salida:', error);
      setSnackbarTipo('error');
      setSnackbarMensaje('Error al eliminar salida');
      setSnackbarAbierto(true);
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleSubmit = async (data: Partial<Salida>) => {
    console.log('🧪 handleSubmit ejecutado');
    console.log('🔍 paqueteActivoParaSalidas:', paqueteActivoParaSalidas);
    console.log('🔍 idAgenciaEnCreacion:', idAgenciaEnCreacion);
    console.log('📦 data recibida:', data);
    console.log('🧭 modoDuplicado:', modoDuplicado);

    if (!paqueteActivoParaSalidas || !idAgenciaEnCreacion) {
      console.warn('⛔ Falta paqueteActivoParaSalidas o idAgenciaEnCreacion — cancelando envío al backend');
      return;
    }

    setLoadingSubmit(true);
    try {
      // Payload base con ids obligatorios
      const payloadBase = {
        ...data,
        paquete_id: paqueteActivoParaSalidas.id,
        usuario_id: idAgenciaEnCreacion,
      } as any;

      console.log('📤 Payload base:', payloadBase);

      if (modoDuplicado) {
        // 👇 Forzar CREAR: remover id si viniera desde el form
        const { id: _omitId, ...payloadCrear } = payloadBase;
        console.log('🟢 crearSalida() por duplicado', payloadCrear);
        await crearSalida(payloadCrear);
        setSnackbarMensaje('Salida duplicada como nueva correctamente');
      } else if (data.id && data.id !== 0) {
        console.log('🟠 editarSalida()', data.id, payloadBase);
        await editarSalida(data.id, payloadBase);
        setSnackbarMensaje('Salida actualizada correctamente');
      } else {
        const { id: _omitId, ...payloadCrear } = payloadBase;
        console.log('🟢 crearSalida()', payloadCrear);
        await crearSalida(payloadCrear);
        setSnackbarMensaje('Salida creada correctamente');
      }

      setSnackbarTipo('success');
      setSnackbarAbierto(true);

      if (idAgenciaEnCreacion) {
        await fetchPaquetesDeAgencia(idAgenciaEnCreacion);
      }
      setModalEditorAbierto(false);
      setModoDuplicado(false); // reset
    } catch (error) {
      console.error('❌ Error al guardar salida:', error);
      setSnackbarTipo('error');
      setSnackbarMensaje('Error al guardar salida');
      setSnackbarAbierto(true);
    } finally {
      setLoadingSubmit(false);
    }
  };

  if (!paqueteActivoParaSalidas) return null;
  const salidas = paqueteActivoParaSalidas.salidas;

  return (
    <>
      <Dialog open onClose={handleClose} maxWidth="lg" fullWidth>
        <DialogTitle>Salidas del paquete: {paqueteActivoParaSalidas.titulo}</DialogTitle>

        <DialogContent dividers>
          {salidas.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Este paquete aún no tiene salidas registradas.
            </Typography>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell />
                  <TableCell>Desde</TableCell>
                  <TableCell>Hasta</TableCell>
                  <TableCell>Cupos</TableCell>
                  <TableCell>Precio doble</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {salidas.map((salida) => {
                  const abierta = expandida === salida.id;
                  return (
                    <Fragment key={salida.id}>
                      <TableRow>
                        <TableCell>
                          <IconButton size="small" onClick={() => setExpandida(abierta ? null : salida.id)}>
                            {abierta ? <CaretDown size={18} /> : <CaretRight size={18} />}
                          </IconButton>
                        </TableCell>
                        <TableCell>{salida.fecha_desde}</TableCell>
                        <TableCell>{salida.fecha_hasta}</TableCell>
                        <TableCell>{salida.cupos}</TableCell>
                        <TableCell>{salida.doble_precio}</TableCell>
                        <TableCell align="right">
                          <Tooltip title="Editar salida">
                            <IconButton onClick={() => handleEditar(salida)} disabled={loadingSubmit}>
                              <PencilSimple size={20} />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Eliminar salida">
                            <IconButton onClick={() => handleEliminar(salida.id)} disabled={loadingSubmit}>
                              <Trash size={20} />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Duplicar salida">
                            <IconButton onClick={() => handleDuplicar(salida)} disabled={loadingSubmit}>
                              <CopySimple size={20} />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell colSpan={6} sx={{ py: 0 }}>
                          <Collapse in={abierta} timeout="auto" unmountOnExit>
                            <Box px={2} py={1}>
                              <Typography variant="subtitle2" gutterBottom>
                                Detalles de la salida
                              </Typography>

                              <Stack spacing={1} direction="row" flexWrap="wrap">
                                <Field label="ID externo" value={salida.salida_externo_id} />
                                <Field label="Venta online" value={salida.venta_online ? 'Sí' : 'No'} />
                                <Field label="Fecha viaje" value={salida.fecha_viaje} />
                                <Field label="Info tramos" value={salida.info_tramos ? 'Sí' : 'No'} />
                                <Field label="Tipo de transporte" value={salida.tipo_transporte} />
                                <Field label="Ida origen" value={salida.ida_origen_ciudad} />
                                <Field label="Ida destino" value={salida.ida_destino_ciudad} />
                                <Field label="Vuelta origen" value={salida.vuelta_origen_ciudad} />
                                <Field label="Vuelta destino" value={salida.vuelta_destino_ciudad} />
                                <Field label="Single $" value={salida.single_precio} />
                                <Field label="Doble $" value={salida.doble_precio} />
                                <Field label="Triple $" value={salida.triple_precio} />
                                <Field label="Cuádruple $" value={salida.cuadruple_precio} />
                                <Field label="Familia 1 $" value={salida.familia_1_precio} />
                                <Field label="Familia 2 $" value={salida.familia_2_precio} />
                              </Stack>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </Fragment>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={handleClose}>
            Cerrar
          </Button>
          <Button variant="contained" onClick={handleCrear} disabled={loadingSubmit}>
            {loadingSubmit ? 'Cargando...' : '+ Agregar salida'}
          </Button>
        </DialogActions>
      </Dialog>

      <ModalSalidaEditor
        open={modalEditorAbierto}
        onClose={() => {
          setModalEditorAbierto(false);
          setModoDuplicado(false); // reset de seguridad al cerrar
        }}
        onSubmit={handleSubmit}
      />

      <Snackbar
        open={snackbarAbierto}
        autoHideDuration={3000}
        onClose={() => setSnackbarAbierto(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbarAbierto(false)}
          severity={snackbarTipo}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbarMensaje}
        </Alert>
      </Snackbar>
    </>
  );
}

const Field = ({ label, value }: { label: string; value: any }) => (
  <Box mr={3} mb={1}>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body2">{value ?? '—'}</Typography>
  </Box>
);
