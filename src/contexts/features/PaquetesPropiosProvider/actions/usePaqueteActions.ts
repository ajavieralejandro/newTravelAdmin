'use client'

import {
  crearPaquetePropio,
  editarPaquetePropio,
  eliminarPaquetePorId,
  fetchPaquetesPorAgencia,
} from '@/components/paquetesPropios/paquetespropiosService'
import type { PaquetePropio } from '@/types/PaquetePropio'
import { Hotel } from '@/types/Hotel'

interface UsePaquetesActionsProps {
  setPaquetesPorAgencia: React.Dispatch<
    React.SetStateAction<Record<string, PaquetePropio[]>>
  >
  setLoadingPorAgencia: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >
  setErrorPorAgencia: React.Dispatch<
    React.SetStateAction<Record<string, string | null>>
  >
}

export const usePaquetesActions = ({
  setPaquetesPorAgencia,
  setLoadingPorAgencia,
  setErrorPorAgencia,
}: UsePaquetesActionsProps) => {
  /* ---------------------------- FETCH POR AGENCIA --------------------------- */
  const fetchPaquetesDeAgencia = async (agenciaId: string) => {
    setLoadingPorAgencia((prev) => ({ ...prev, [agenciaId]: true }))
    setErrorPorAgencia((prev) => ({ ...prev, [agenciaId]: null }))

    try {
      const paquetesRaw = await fetchPaquetesPorAgencia(agenciaId)

      const paquetesTransformados: PaquetePropio[] = paquetesRaw.map(
        (paqueteRaw: any) => {
          let hotel: Hotel | null = paqueteRaw.hotel ?? null

          // Si no viene `hotel`, intentamos parsear `hoteles`
          if (!hotel && typeof paqueteRaw.hoteles === 'string') {
            try {
              const parsed = JSON.parse(paqueteRaw.hoteles)
              if (Array.isArray(parsed) && parsed.length > 0) {
                hotel = parsed[0]
              }
            } catch (error) {
              console.warn(
                `❗ Error al parsear 'hoteles' del paquete ${paqueteRaw.id}`,
                error,
              )
            }
          }

          const { hoteles, ...rest } = paqueteRaw

          return {
            ...rest,
            hotel,
          } as PaquetePropio
        },
      )

      setPaquetesPorAgencia((prev) => ({
        ...prev,
        [agenciaId]: paquetesTransformados,
      }))
    } catch (error: any) {
      setErrorPorAgencia((prev) => ({
        ...prev,
        [agenciaId]: error.message,
      }))
    } finally {
      setLoadingPorAgencia((prev) => ({
        ...prev,
        [agenciaId]: false,
      }))
    }
  }

  /* ------------------------------ ELIMINACIÓN ------------------------------- */
  const eliminarPaquete = async (paqueteId: number) => {
    try {
      await eliminarPaquetePorId(paqueteId)
      setPaquetesPorAgencia((prev) => {
        const actualizado = { ...prev }
        for (const key in actualizado) {
          actualizado[key] = actualizado[key].filter((p) => p.id !== paqueteId)
        }
        return actualizado
      })
    } catch (error) {
      console.error('Error al eliminar paquete:', error)
    }
  }

  /* ----------------------- CREAR / EDITAR / DUPLICAR ------------------------ */
  const crearPaquete = async (formData: FormData, agenciaId: string) => {
    const nuevo = await crearPaquetePropio(formData)
    setPaquetesPorAgencia((prev) => ({
      ...prev,
      [agenciaId]: [...(prev[agenciaId] || []), nuevo],
    }))
  }

  const editarPaquete = async (
    id: number,
    formData: FormData,
    agenciaId: string,
  ) => {
    const actualizado = await editarPaquetePropio(id, formData)
    setPaquetesPorAgencia((prev) => ({
      ...prev,
      [agenciaId]: prev[agenciaId].map((p) =>
        p.id === id ? actualizado : p,
      ),
    }))
  }

  /** Crea un duplicado en el backend y lo agrega al estado */
  const ejecutarDuplicadoPaquete = async (
    formData: FormData,
    agenciaId: string,
  ) => {
    const duplicado = await crearPaquetePropio(formData)
    setPaquetesPorAgencia((prev) => ({
      ...prev,
      [agenciaId]: [...(prev[agenciaId] || []), duplicado],
    }))
  }

  return {
    fetchPaquetesDeAgencia,
    eliminarPaquete,
    crearPaquete,
    editarPaquete,
    ejecutarDuplicadoPaquete,
  }
}
