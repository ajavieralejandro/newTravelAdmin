import type { AgenciaBackData } from '../../../../types/AgenciaBackData';

const useAgenciasQueries = (agencias: AgenciaBackData[]) => {
  /**
   * Obtiene una agencia por su dominio (ID)
   */
  const getAgenciaById = (id: string): AgenciaBackData | undefined => {
    if (!id || typeof id !== 'string') return undefined;
    return agencias.find(agencia =>
      agencia.dominio.toLowerCase() === id.toLowerCase()
    );
  };

  /**
   * Filtra agencias por criterios dinámicos
   */
  const filterAgencias = (criterios: Partial<AgenciaBackData>): AgenciaBackData[] => {
    return agencias.filter(agencia => {
      return Object.entries(criterios).every(([key, value]) => {
        const agenciaValue = agencia[key as keyof AgenciaBackData];
        // Búsqueda case-insensitive para strings
        if (typeof value === 'string' && typeof agenciaValue === 'string') {
          return agenciaValue.toLowerCase().includes(value.toLowerCase());
        }
        return agenciaValue === value;
      });
    });
  };

  return {
    getAgenciaById,
    filterAgencias,
  };
};

export default useAgenciasQueries;

