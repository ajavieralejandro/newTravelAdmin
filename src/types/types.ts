import type { AgenciaBackData } from './AgenciaBackData';

export interface AgenciasContextState {
  agencias: AgenciaBackData[]; // ✅ ahora contiene la info real que viene del backend
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

