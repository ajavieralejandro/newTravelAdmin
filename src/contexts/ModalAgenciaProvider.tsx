// contexts/ModalAgenciaProvider.tsx
'use client';
import React, { createContext, useContext, useState, useCallback } from 'react';
import type { AgenciaBackData } from '@/types/AgenciaBackData';

interface ModalAgenciaContextType {
  isOpen: boolean;
  datosEdicion?: AgenciaBackData; // undefined = crear, objeto = editar
  openModal: (agencia?: AgenciaBackData) => void;
  openModalCrear: () => void;
  openModalEditar: (agencia: AgenciaBackData) => void;
  closeModal: () => void;
  setDatosEdicion: (agencia?: AgenciaBackData) => void;
}

const ModalAgenciaContext = createContext<ModalAgenciaContextType | undefined>(undefined);

export const ModalAgenciaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [datosEdicion, setDatosEdicion] = useState<AgenciaBackData | undefined>(undefined);

  const openModal = useCallback((agencia?: AgenciaBackData) => {
    setDatosEdicion(agencia);
    setIsOpen(true);
  }, []);

  const openModalCrear = useCallback(() => {
    setDatosEdicion(undefined);
    setIsOpen(true);
  }, []);

  const openModalEditar = useCallback((agencia: AgenciaBackData) => {
    setDatosEdicion(agencia);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setDatosEdicion(undefined);
  }, []);

  return (
    <ModalAgenciaContext.Provider
      value={{
        isOpen,
        datosEdicion,
        openModal,
        openModalCrear,
        openModalEditar,
        closeModal,
        setDatosEdicion,
      }}
    >
      {children}
    </ModalAgenciaContext.Provider>
  );
};

export const useModalAgenciaGlobal = () => {
  const context = useContext(ModalAgenciaContext);
  if (!context) {
    throw new Error('useModalAgenciaGlobal debe usarse dentro de ModalAgenciaProvider');
  }
  return context;
};
