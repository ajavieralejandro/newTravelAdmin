// types/Salidas.ts

export interface Salida {
  id: number
  paquete_id: number
  salida_externo_id: number | null

  venta_online: boolean
  cupos: number

  fecha_viaje: string | null
  fecha_desde: string
  fecha_hasta: string

  info_tramos: boolean

  // ✅ NUEVO CAMPO
  tipo_transporte: 'avion' | 'bus' | 'sin_transporte'

  ida_origen_fecha: string
  ida_origen_hora: string | null
  ida_origen_ciudad: string | null

  ida_destino_fecha: string | null
  ida_destino_hora: string | null
  ida_destino_ciudad: string | null

  ida_clase_vuelo: string | null
  ida_linea_aerea: string | null
  ida_vuelo: string | null
  ida_escalas: string | null

  vuelta_origen_fecha: string | null
  vuelta_origen_hora: string | null
  vuelta_origen_ciudad: string | null

  vuelta_destino_fecha: string | null
  vuelta_destino_hora: string | null
  vuelta_destino_ciudad: string | null

  vuelta_clase_vuelo: string | null
  vuelta_linea_aerea: string | null
  vuelta_vuelo: string | null
  vuelta_escalas: string | null

  // Precios por tipo de habitación (actualizados a number)
  single_precio: number
  single_impuesto: number
  single_otro: number
  single_otro2: number

  doble_precio: number
  doble_impuesto: number
  doble_otro: number
  doble_otro2: number

  triple_precio: number
  triple_impuesto: number
  triple_otro: number
  triple_otro2: number

  cuadruple_precio: number
  cuadruple_impuesto: number
  cuadruple_otro: number
  cuadruple_otro2: number

  familia_1_precio: number
  familia_1_impuesto: number
  familia_1_otro: number
  familia_1_otro2: number

  familia_2_precio: number
  familia_2_impuesto: number
  familia_2_otro: number
  familia_2_otro2: number

  created_at: string
  updated_at: string
}
