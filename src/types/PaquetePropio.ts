import { Salida } from './Salidas'
import { Hotel } from './Hotel'

export interface PaquetePropio {
  id: number
  titulo: string
  descripcion: string
  pais: string
  ciudad: string
  ciudad_iata: string | null

  fecha_vigencia_desde: string // formato "DD-MM-YYYY"
  fecha_vigencia_hasta: string

  cant_noches: number
  tipo_producto: string | null
  activo: boolean
  prioridad: 'alta' | 'media' | 'baja'


  imagen_principal: string
  edad_menores: number
  transporte: string | null
  tipo_moneda: string

  descuento: string // viene como "0.00"

  componentes: {
    tipo: string
    detalle: string
  }[] // viene como string serializado, parsear antes de usar

  categorias: string[]         // lo mismo: parsear
  hotel: Hotel                 // ✅ actualizado: ahora es un objeto
  galeria_imagenes: string[]   // lo mismo

  slug?: string
  paquete_externo_id?: string
  usuario?: string | null
  usuario_id?: number
  fecha_modificacion?: string | null

  created_at?: string
  updated_at?: string

  salidas: Salida[]
}

// Interfaces para manejar datos parciales y variantes
export interface PaqueteRaw {
  id?: number
  titulo?: string
  descripcion?: string
  pais?: string
  ciudad?: string
  ciudad_iata?: string | null
  fecha_vigencia_desde?: string
  fecha_vigencia_hasta?: string
  cant_noches?: number
  tipo_producto?: string | null
  activo?: boolean
  prioridad?: 'alta' | 'media' | 'baja'
  imagen_principal?: string
  edad_menores?: number
  transporte?: string | null
  tipo_moneda?: string
  descuento?: string
  componentes?: string | { tipo: string; detalle: string }[]
  categorias?: string | string[]
  hotel?: Hotel | string
  galeria_imagenes?: string | string[]
  slug?: string
  paquete_externo_id?: string
  usuario?: string | null
  usuario_id?: number
  fecha_modificacion?: string | null
  created_at?: string
  updated_at?: string
  salidas?: Salida[]
}

// Tipo para datos de formulario de paquete
export interface PaqueteFormData {
  titulo: string
  descripcion: string
  pais: string
  ciudad: string
  ciudad_iata: string
  fecha_vigencia_desde: string
  fecha_vigencia_hasta: string
  cant_noches: string
  tipo_producto: string
  activo: string
  prioridad: 'alta' | 'media' | 'baja'
  edad_menores: string
  transporte: string
  tipo_moneda: string
  descuento: string
  componentes: string
  categorias: string
  hotel: string
  galeria_imagenes: string
  agencia_id: string
}
