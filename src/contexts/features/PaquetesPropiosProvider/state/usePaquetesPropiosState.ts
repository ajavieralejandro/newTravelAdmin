'use client'

import { useState } from 'react'
import type { PaquetePropio } from '@/types/PaquetePropio'

export const usePaquetesPropiosState = () => {
  const [paquetesPorAgencia, setPaquetesPorAgencia] = useState<Record<string, PaquetePropio[]>>({})
  const [loadingPorAgencia, setLoadingPorAgencia] = useState<Record<string, boolean>>({})
  const [errorPorAgencia, setErrorPorAgencia] = useState<Record<string, string | null>>({})

  return {
    paquetesPorAgencia,
    loadingPorAgencia,
    errorPorAgencia,
    setPaquetesPorAgencia,
    setLoadingPorAgencia,
    setErrorPorAgencia,
  }
}
