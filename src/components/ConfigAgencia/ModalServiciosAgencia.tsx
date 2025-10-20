// components/ConfigAgencia/ModalServiciosAgencia.tsx
'use client';

import { Box, Modal, useMediaQuery, useTheme } from '@mui/material';

import { ServiciosNavbar } from './ServiciosNavbar';
import { VistasServicios } from '@/app/dashboard/servicios'; // ✅ Importación corregida desde index.ts
import { useModalServiciosAgencia } from './useModalServiciosAgencia';
import type { AgenciaBackData } from '@/types/AgenciaBackData';

interface ModalServiciosAgenciaProps {
  open: boolean;
  onClose: () => void;
  agencia: AgenciaBackData;
}

export const ModalServiciosAgencia = ({
  open,
  onClose,
  agencia,
}: ModalServiciosAgenciaProps) => {
  const {
    secciones,
    seccionActiva,
    setSeccionActiva,
    seccionHabilitada,
  } = useModalServiciosAgencia();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleImplementarCambios = () => {
    console.log('[🔧 Implementar cambios] → datos aún no implementados');
    onClose();
  };

  const Componente = VistasServicios[seccionActiva];

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: isMobile ? '90%' : '80%',
          height: isMobile ? '90%' : 600,
          bgcolor: 'background.paper',
          boxShadow: 24,
          borderRadius: 2,
          display: 'flex',
          flexDirection: 'row',
          overflow: 'hidden',
        }}
      >
        <ServiciosNavbar
          secciones={secciones}
          seccionSeleccionada={seccionActiva}
          onSeleccionarSeccion={setSeccionActiva}
          seccionHabilitada={seccionHabilitada}
          onImplementarCambios={handleImplementarCambios}
        />

        {/* 📄 Contenido dinámico */}
        {Componente ? (
          // Pasamos ambos para compatibilidad: agencia (objeto) y agenciaId (contrato unificado)
          <Componente {...({ agencia, agenciaId: agencia.idAgencia } as any)} />
        ) : (
          <Box sx={{ p: 3 }}>Sección no implementada.</Box>
        )}
      </Box>
    </Modal>
  );
};
