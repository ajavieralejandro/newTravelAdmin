// app/dashboard/customers/page.tsx
'use client';

import * as React from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AddBusinessIcon from '@mui/icons-material/AddBusiness';

import BotonAccion from '@/components/form/BotonAccion';
import AgenciaModal from '@/components/form/AgenciaModal';
import { useAgenciasContext } from '@/contexts/features/Agencias/AgenciaProvider';
import { useModalAgenciaGlobal } from '@/contexts/ModalAgenciaProvider';

// ⬇️ Eliminado: CustomersFilters
// import { CustomersFilters } from '@/components/dashboard/customer/customers-filters';

import { CustomersTable } from '@/components/dashboard/customer/customers-table';
import { AgenciaBackData } from '@/types/AgenciaBackData';

import { ModalServiciosAgencia } from '@/components/ConfigAgencia/ModalServiciosAgencia';
import { useModalServiciosAgenciaSuper } from './useModalServiciosAgenciaSuper';
import { useUser } from '@/hooks/use-user';

export default function Page(): React.JSX.Element {
  const { state, actions } = useAgenciasContext();
  const { agencias } = state;
  const { user } = useUser();

  React.useEffect(() => {
    if (user?.rol === 'superadmin' && agencias.length === 0) {
      console.log('👑 Cargando agencias (solo superadmin)');
      actions.fetchAgencias();
    }
  }, [user?.rol, agencias.length, actions]);

  // 🔧 Modal Agencia (contrato nuevo)
  const { isOpen, openModalCrear, openModalEditar } = useModalAgenciaGlobal();

  const {
    modalServiciosOpen,
    agenciaSeleccionada,
    abrirModalServicios,
    cerrarModalServicios,
  } = useModalServiciosAgenciaSuper();

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  const handleAbrirCreacion = () => {
    openModalCrear(); // crear => datosEdicion = undefined
  };

  const handleEditarAgencia = (agencia: AgenciaBackData) => {
    const agenciaOriginal = agencias.find((a) => a.idAgencia === agencia.idAgencia);
    if (agenciaOriginal) {
      openModalEditar(agenciaOriginal); // editar => pasa objeto completo
    } else {
      console.warn('No se encontró la agencia para editar:', agencia.idAgencia);
    }
  };

  const handleEliminarAgencia = async (agencia: AgenciaBackData) => {
    const confirmado = window.confirm(
      `¿Estás seguro de que querés eliminar la agencia "${agencia.nombre}"?`
    );
    if (!confirmado) return;

    const result = await actions.deleteAgencia(agencia.idAgencia);
    if (result.success) {
      console.log(`✅ Agencia eliminada: ${agencia.nombre}`);
    } else {
      console.error(`❌ Error eliminando agencia: ${result.error}`);
    }
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">Agencias</Typography>
        </Stack>
        <div>
          <BotonAccion
            icono={<AddBusinessIcon />}
            label="Crear Agencia"
            color="primary"
            variant="contained"
            onClickHooks={[handleAbrirCreacion]}
          />
        </div>
      </Stack>

      {/* ⬇️ Eliminado el filtro */}
      {/* <CustomersFilters /> */}

      <CustomersTable
        rows={agencias}
        count={agencias.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onEdit={handleEditarAgencia}
        onServicios={abrirModalServicios} // no se muestra si quitaste la columna en la tabla
        onEliminar={handleEliminarAgencia}
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
      />

      {isOpen && <AgenciaModal />}

      {modalServiciosOpen && agenciaSeleccionada && (
        <ModalServiciosAgencia
          open={modalServiciosOpen}
          onClose={cerrarModalServicios}
          agencia={agenciaSeleccionada}
        />
      )}
    </Stack>
  );
}
