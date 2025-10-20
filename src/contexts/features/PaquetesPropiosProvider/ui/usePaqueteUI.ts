'use client';

import { useState } from 'react';
import type { PaquetePropio } from '@/types/PaquetePropio';

export const usePaqueteUI = () => {
  const [paqueteSeleccionado, setPaqueteSeleccionado] = useState<PaquetePropio | null>(null);
  const [paqueteADuplicar, setPaqueteADuplicar] = useState<PaquetePropio | null>(null);
  const [paqueteActivoParaSalidas, setPaqueteActivoParaSalidas] = useState<PaquetePropio | null>(null);

  const [modalAbierto, setModalAbierto] = useState<boolean>(false);
  const [idAgenciaEnCreacion, setIdAgenciaEnCreacion] = useState<string | null>(null);

  const abrirModal = () => setModalAbierto(true);

  const cerrarModal = () => {
    setModalAbierto(false);
    setPaqueteSeleccionado(null);
    setPaqueteADuplicar(null);
    setPaqueteActivoParaSalidas(null);
    setIdAgenciaEnCreacion(null);
  };

  const seleccionarPaquete = (paquete: PaquetePropio | null) => {
    setPaqueteSeleccionado(paquete);
    setPaqueteADuplicar(null);

    if (paquete?.usuario_id) {
      setIdAgenciaEnCreacion(String(paquete.usuario_id));
    }

    setModalAbierto(true);
  };

  const prepararDuplicadoPaquete = (paquete: PaquetePropio, agenciaId: string) => {
    setPaqueteADuplicar(paquete);
    setPaqueteSeleccionado(null);
    setIdAgenciaEnCreacion(agenciaId);
    setModalAbierto(true);
  };

  const abrirModalCreacion = (agenciaId: string) => {
    setIdAgenciaEnCreacion(agenciaId);
    seleccionarPaquete(null);
  };

  const seleccionarPaqueteParaSalidas = (paquete: PaquetePropio, agenciaId: string) => {
    setPaqueteActivoParaSalidas(paquete);
    setIdAgenciaEnCreacion(agenciaId);
  };

  const limpiarPaqueteParaSalidas = () => {
    setPaqueteActivoParaSalidas(null);
    setIdAgenciaEnCreacion(null);
  };

  return {
    paqueteSeleccionado,
    paqueteADuplicar,
    paqueteActivoParaSalidas,
    setPaqueteActivoParaSalidas,
    seleccionarPaqueteParaSalidas,
    limpiarPaqueteParaSalidas, // ✅ agregado
    modalAbierto,
    idAgenciaEnCreacion,
    setIdAgenciaEnCreacion,
    seleccionarPaquete,
    prepararDuplicadoPaquete,
    abrirModal,
    cerrarModal,
    abrirModalCreacion,
  };
};
