'use client';

import React, { createContext, useContext, useMemo } from 'react';
import type { PaquetesPropiosContextType } from './PaquetesPropiosContextType';

import { usePaquetesPropiosState } from './state/usePaquetesPropiosState';
import { usePaqueteUI } from './ui/usePaqueteUI';
import { useSalidasUI } from './ui/useSalidaUI';
import { usePaquetesActions } from './actions/usePaqueteActions';

const PaquetesPropiosContext = createContext<PaquetesPropiosContextType | undefined>(undefined);

export const PaquetesPropiosProvider = ({ children }: { children: React.ReactNode }) => {
  /* ---------- estado base paquetes ---------- */
  const {
    paquetesPorAgencia,
    loadingPorAgencia,
    errorPorAgencia,
    setPaquetesPorAgencia,
    setLoadingPorAgencia,
    setErrorPorAgencia,
  } = usePaquetesPropiosState();

  /* ---------- UI paquetes ---------- */
  const {
    paqueteSeleccionado,
    paqueteADuplicar,
    paqueteActivoParaSalidas,          // ✅
    seleccionarPaqueteParaSalidas,     // ✅
    modalAbierto,
    idAgenciaEnCreacion,
    seleccionarPaquete,
    prepararDuplicadoPaquete,
    abrirModal,
    cerrarModal,
    abrirModalCreacion,
    setIdAgenciaEnCreacion,
    limpiarPaqueteParaSalidas,         // ✅ nuevo
  } = usePaqueteUI();

  /* ---------- UI salidas ---------- */
  const {
    salidaSeleccionada,
    salidaADuplicar,
    seleccionarSalida,
    duplicarSalida,
    limpiarSalidaSeleccionada,
    limpiarSalidaADuplicar,
    setSalidaSeleccionada,
    setSalidaADuplicar,
  } = useSalidasUI(paquetesPorAgencia);

  /* ---------- acciones API ---------- */
  const {
    fetchPaquetesDeAgencia,
    eliminarPaquete,
    crearPaquete,
    editarPaquete,
    ejecutarDuplicadoPaquete,
  } = usePaquetesActions({
    setPaquetesPorAgencia,
    setLoadingPorAgencia,
    setErrorPorAgencia,
  });

  /* ---------- value memo ---------- */
  const contextValue: PaquetesPropiosContextType = useMemo(
    () => ({
      paquetesPorAgencia,
      loadingPorAgencia,
      errorPorAgencia,

      /* paquetes */
      paqueteSeleccionado,
      paqueteADuplicar,
      prepararDuplicadoPaquete,
      seleccionarPaquete,

      /* salidas */
      salidaSeleccionada,
      salidaADuplicar,
      setSalidaSeleccionada,
      setSalidaADuplicar,
      seleccionarSalida,
      duplicarSalida,
      limpiarSalidaSeleccionada,
      limpiarSalidaADuplicar,
      paqueteActivoParaSalidas,        // ✅ expuesto
      seleccionarPaqueteParaSalidas,   // ✅ expuesto
      limpiarPaqueteParaSalidas,       // ✅ agregado

      /* ui global */
      modalAbierto,
      abrirModal,
      cerrarModal,
      abrirModalCreacion,
      idAgenciaEnCreacion,
      setIdAgenciaEnCreacion,

      /* acciones API */
      fetchPaquetesDeAgencia,
      eliminarPaquete,
      crearPaquete,
      editarPaquete,
      ejecutarDuplicadoPaquete,
    }),
    [
      paquetesPorAgencia,
      loadingPorAgencia,
      errorPorAgencia,
      paqueteSeleccionado,
      paqueteADuplicar,
      salidaSeleccionada,
      salidaADuplicar,
      paqueteActivoParaSalidas,
      seleccionarPaqueteParaSalidas,
      limpiarPaqueteParaSalidas, // ✅ dependencia añadida
      modalAbierto,
      idAgenciaEnCreacion,
    ],
  );

  return (
    <PaquetesPropiosContext.Provider value={contextValue}>
      {children}
    </PaquetesPropiosContext.Provider>
  );
};

/* ---------- custom hook ---------- */
export const usePaquetesPropiosContext = () => {
  const context = useContext(PaquetesPropiosContext);
  if (!context) {
    throw new Error('usePaquetesPropiosContext debe usarse dentro de PaquetesPropiosProvider');
  }
  return context;
};
