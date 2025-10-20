'use client'

import { useState } from 'react'
import type { PaquetePropio } from '@/types/PaquetePropio'
import type { Salida } from '@/types/Salidas'

export const useSalidasUI = (paquetesPorAgencia: Record<string, PaquetePropio[]>) => {
  const [salidaSeleccionada, setSalidaSeleccionada] = useState<Salida | null>(null)
  const [salidaADuplicar, setSalidaADuplicar] = useState<Salida | null>(null)
  const [paqueteActivoParaSalidas, setPaqueteActivoParaSalidas] = useState<PaquetePropio | null>(null)

  const seleccionarSalida = (salida: Salida, paqueteId: number, agenciaId: string) => {
    const paquete = paquetesPorAgencia[agenciaId]?.find(p => p.id === paqueteId) ?? null
    setSalidaSeleccionada(salida)
    setSalidaADuplicar(null)
    setPaqueteActivoParaSalidas(paquete)
  }

  const duplicarSalida = (salida: Salida, paqueteId: number, agenciaId: string) => {
    const paquete = paquetesPorAgencia[agenciaId]?.find(p => p.id === paqueteId) ?? null
    setSalidaADuplicar(salida)
    setSalidaSeleccionada(null)
    setPaqueteActivoParaSalidas(paquete)
  }

  const limpiarSalidaSeleccionada = () => setSalidaSeleccionada(null)
  const limpiarSalidaADuplicar = () => setSalidaADuplicar(null)
  const limpiarPaqueteParaSalidas = () => setPaqueteActivoParaSalidas(null)

  const seleccionarPaqueteParaSalidas = (paquete: PaquetePropio) => {
    setPaqueteActivoParaSalidas(paquete)
  }

  return {
    salidaSeleccionada,
    salidaADuplicar,
    paqueteActivoParaSalidas,

    seleccionarSalida,
    duplicarSalida,
    limpiarSalidaSeleccionada,
    limpiarSalidaADuplicar,
    limpiarPaqueteParaSalidas,
    seleccionarPaqueteParaSalidas,

    setSalidaADuplicar,
    setSalidaSeleccionada, // ✅ agregado para corregir error en el provider
  }
}
