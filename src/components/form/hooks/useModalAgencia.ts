'use client';

import { useState } from 'react';

/**
 * Hook personalizado para manejar el estado de un modal de agencia
 * 
 * @returns {Object} Retorna el estado y métodos para controlar el modal
 * @property {boolean} isOpen - Indica si el modal está abierto
 * @property {function} openModal - Función para abrir el modal
 * @property {function} closeModal - Función para cerrar el modal
 */
const useModalAgencia = () => {
  const [isOpen, setIsOpen] = useState(false);

  /**
   * Abre el modal
   */
  const openModal = () => {
    setIsOpen(true);
  };

  /**
   * Cierra el modal y resetea cualquier estado interno si es necesario
   */
  const closeModal = () => {
    setIsOpen(false);
    // Aquí podrías añadir lógica adicional de reset si necesitas
  };

  return {
    isOpen,
    openModal,
    closeModal,
  };
};

export default useModalAgencia;
