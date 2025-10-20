'use client';

import { usePaquetesPropios } from '../usePaquetesPropios';

/**
 * Hook para cargar los paquetes propios de una agencia específica
 * utilizando el contexto global de PaquetesPropios.
 */
export const useFetchPaquetesDeAgencia = () => {
  const {
    paquetesPorAgencia,
    fetchPaquetesDeAgencia,
    loadingPorAgencia,
    errorPorAgencia,
  } = usePaquetesPropios();

  /**
   * Llama a la carga solo si no están cargados todavía.
   * @param idAgencia ID de la agencia (string)
   */
  const cargarSiNoExiste = async (idAgencia: string) => {
    if (!(idAgencia in paquetesPorAgencia)) {
      await fetchPaquetesDeAgencia(idAgencia);
    }
  };

  return {
    cargarSiNoExiste,
    loadingPorAgencia,
    errorPorAgencia,
    paquetesPorAgencia,
  };
};
