import type { PaquetePropio } from '@/types/PaquetePropio'
import type { Salida } from '@/types/Salidas'

export interface PaquetesPropiosContextType {
  paquetesPorAgencia: Record<string, PaquetePropio[]>
  loadingPorAgencia: Record<string, boolean>
  errorPorAgencia: Record<string, string | null>

  paqueteSeleccionado: PaquetePropio | null
  paqueteADuplicar: PaquetePropio | null
  paqueteActivoParaSalidas: PaquetePropio | null

  salidaSeleccionada: Salida | null
  salidaADuplicar: Salida | null
  setSalidaSeleccionada: (salida: Salida | null) => void // ✅ agregado
  setSalidaADuplicar: (salida: Salida | null) => void
  limpiarSalidaSeleccionada: () => void
  limpiarSalidaADuplicar: () => void
  seleccionarSalida: (salida: Salida, paqueteId: number, agenciaId: string) => void

  modalAbierto: boolean
  idAgenciaEnCreacion: string | null
  setIdAgenciaEnCreacion: (id: string | null) => void

  fetchPaquetesDeAgencia: (agenciaId: string) => Promise<void>
  eliminarPaquete: (paqueteId: number) => Promise<void>
  crearPaquete: (formData: FormData, agenciaId: string) => Promise<void>
  editarPaquete: (id: number, formData: FormData, agenciaId: string) => Promise<void>
  ejecutarDuplicadoPaquete: (formData: FormData, agenciaId: string) => Promise<void>

  prepararDuplicadoPaquete: (paquete: PaquetePropio, agenciaId: string) => void
  seleccionarPaquete: (paquete: PaquetePropio | null) => void
  seleccionarPaqueteParaSalidas: (paquete: PaquetePropio, agenciaId: string) => void
  limpiarPaqueteParaSalidas: () => void

  abrirModal: () => void
  cerrarModal: () => void
  abrirModalCreacion: (agenciaId: string) => void
}
