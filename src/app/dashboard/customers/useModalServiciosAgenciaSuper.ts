// app/dashboard/customers/useModalServiciosAgenciaSuper.ts
'use client';

import { useState } from 'react';
import type { AgenciaBackData } from '@/types/AgenciaBackData';

export function useModalServiciosAgenciaSuper() {
  const [modalServiciosOpen, setModalServiciosOpen] = useState(false);
  const [agenciaSeleccionada, setAgenciaSeleccionada] = useState<AgenciaBackData | null>(null);

  const abrirModalServicios = (agencia: AgenciaBackData) => {
    console.log('🟢 Modal de Servicios abierto para:', agencia);
    setAgenciaSeleccionada(agencia);
    setModalServiciosOpen(true);
  };

  const cerrarModalServicios = () => {
    setAgenciaSeleccionada(null);
    setModalServiciosOpen(false);
  };

  return {
    modalServiciosOpen,
    agenciaSeleccionada,
    abrirModalServicios,
    cerrarModalServicios,
  };
}

