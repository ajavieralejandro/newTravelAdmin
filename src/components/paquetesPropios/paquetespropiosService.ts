'use client'

import type { PaquetePropio, PaqueteFormData } from '@/types/PaquetePropio'

/* Helpers */
const toFormData = (data: FormData | PaqueteFormData): FormData => {
  if (data instanceof FormData) return data
  const fd = new FormData()
  Object.entries(data).forEach(([k, v]) => {
    if (v === undefined || v === null) return
    fd.append(k, typeof v === 'string' ? v : String(v))
  })
  return fd
}

/**
 * Fetch de paquetes propios por agencia (respuesta ya viene lista según tu contrato actual).
 */
export const fetchPaquetesPorAgencia = async (agenciaId: string): Promise<PaquetePropio[]> => {
  console.log(`📡 Llamando a fetchPaquetesPorAgencia con agenciaId: ${agenciaId}`)
  try {
    const res = await fetch(`https://travelconnect.com.ar/paquetes/agencia/${agenciaId}`)
    console.log(`🛰️ Respuesta HTTP status: ${res.status}`)
    if (!res.ok) throw new Error(`Error al obtener paquetes de la agencia ${agenciaId}`)

    const json = await res.json()
    // Asumimos que el backend ya devuelve el shape compatible con PaquetePropio[]
    return json as PaquetePropio[]
  } catch (error) {
    console.error(`🛑 Error en fetchPaquetesPorAgencia(${agenciaId}):`, error)
    throw error
  }
}

/**
 * Elimina un paquete propio por su ID.
 */
export const eliminarPaquetePorId = async (idPaquete: number): Promise<boolean> => {
  try {
    const res = await fetch(`https://travelconnect.com.ar/delete_paquete/${idPaquete}`, { method: 'DELETE' })
    console.log(`🗑️ Eliminar paquete ID: ${idPaquete} - Status: ${res.status}`)
    if (!res.ok) {
      const errorText = await res.text()
      console.error(`❌ Error HTTP al eliminar paquete ${idPaquete}:`, errorText)
      throw new Error(`Error al eliminar paquete ${idPaquete}`)
    }
    return true
  } catch (error) {
    console.error(`🛑 Error en eliminarPaquetePorId(${idPaquete}):`, error)
    throw error
  }
}

/**
 * Crea un nuevo paquete propio.
 * Usa endpoint legacy: POST /create_paquete2/{agenciaId}
 * El agenciaId se toma del propio payload (campo 'agencia_id').
 */
export const crearPaquetePropio = async (data: FormData | PaqueteFormData): Promise<PaquetePropio> => {
  const fd = toFormData(data)

  const agenciaVal = fd.get('agencia_id')
  const agenciaId = agenciaVal !== null ? String(agenciaVal) : null
  if (!agenciaId) {
    console.error('❌ Falta agencia_id en el payload para crear paquete.')
    throw new Error('Falta agencia_id para crear el paquete')
  }

  console.group('📤 [CREAR PAQUETE] Payload FormData')
  fd.forEach((value, key) => console.log(`   ${key}:`, value))
  console.groupEnd()

  try {
    const res = await fetch(`https://travelconnect.com.ar/create_paquete2/${agenciaId}`, {
      method: 'POST',
      body: fd,
    })

    console.log('📥 Resultado al crear paquete - Status:', res.status)
    if (!res.ok) {
      const errorText = await res.text()
      console.error('❌ Error al crear paquete:', errorText)
      throw new Error(`Error al crear paquete: ${errorText}`)
    }

    const result = await res.json()
    return result as PaquetePropio
  } catch (error) {
    console.error('❌ Error al crear paquete:', error)
    throw error
  }
}

/**
 * Edita un paquete propio existente.
 * Usa endpoint legacy: POST /paquete/update/{id}
 */
export const editarPaquetePropio = async (id: number, data: FormData | PaqueteFormData): Promise<PaquetePropio> => {
  const fd = toFormData(data)

  console.group(`✏️ [EDITAR PAQUETE] ID ${id} - Payload FormData`)
  fd.forEach((value, key) => console.log(`   ${key}:`, value))
  console.groupEnd()

  try {
    const res = await fetch(`https://travelconnect.com.ar/paquetes/${id}/update`, {
      method: 'POST',
      body: fd,
    })

    console.log(`📥 Resultado al editar paquete ID ${id}:`, res.status)
    if (!res.ok) {
      const errorText = await res.text()
      console.error(`❌ Error al editar paquete ID ${id}:`, errorText)
      throw new Error(`Error al editar paquete: ${errorText}`)
    }

    const result = await res.json()
    return result as PaquetePropio
  } catch (error) {
    console.error(`❌ Error al editar paquete ID ${id}:`, error)
    throw error
  }
}
