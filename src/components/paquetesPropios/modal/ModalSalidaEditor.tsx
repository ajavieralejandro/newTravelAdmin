'use client'

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material'
import { useState, useEffect, FormEvent } from 'react'
import { Salida } from '@/types/Salidas'
import FormularioSalida from '../salidas/FomularioSalida'
import { usePaquetesPropios } from '@/contexts/features/PaquetesPropiosProvider/usePaquetesPropios'

interface ModalSalidaEditorProps {
  open: boolean
  onClose: () => void
  onSubmit: (salida: Salida) => void
}

export default function ModalSalidaEditor({
  open,
  onClose,
  onSubmit
}: ModalSalidaEditorProps) {
  const {
    salidaSeleccionada,
    salidaADuplicar,
    limpiarSalidaSeleccionada,
    setSalidaADuplicar,
    paqueteActivoParaSalidas,
    idAgenciaEnCreacion
  } = usePaquetesPropios()

  const [formData, setFormData] = useState<Salida>(getInitialSalida())

  useEffect(() => {
    const origen = salidaSeleccionada ?? salidaADuplicar ?? null

    if (!origen) {
      setFormData(getInitialSalida())
      return
    }

    // Construir base completa (no perder campos)
    const full: Salida = {
      ...getInitialSalida(), // defaults seguros
      ...origen,             // datos reales del backend
      paquete_id: paqueteActivoParaSalidas?.id ?? origen.paquete_id ?? 0,
      tipo_transporte: (origen.tipo_transporte as Salida['tipo_transporte']) ?? 'sin_transporte',
    }

    // Normalizar SOLO fechas a formato de input (YYYY-MM-DD)
    const fechas: (keyof Salida)[] = [
      'fecha_desde', 'fecha_hasta', 'fecha_viaje',
      'ida_origen_fecha', 'ida_destino_fecha',
      'vuelta_origen_fecha', 'vuelta_destino_fecha'
    ]

    fechas.forEach((campo) => {
      const val = full[campo] as unknown as string | null | undefined
      ;(full as any)[campo] = toInputDate(val)
    })

    setFormData(full)
  }, [
    salidaSeleccionada,
    salidaADuplicar,
    open,
    paqueteActivoParaSalidas,
    idAgenciaEnCreacion
  ])

  const handleChange = (campo: keyof Salida, valor: string | number | boolean | null) => {
    setFormData(prev => ({ ...prev, [campo]: valor }) as Salida)
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const salidaFinal = limpiarCamposDeVueloSiNoCorresponde(formData)
    onSubmit(salidaFinal)
    limpiarSalidaSeleccionada()
    setSalidaADuplicar(null)
    onClose()
  }

  const getTitulo = () => {
    if (salidaADuplicar) return 'Duplicar salida'
    if (salidaSeleccionada) return 'Editar salida'
    return 'Agregar nueva salida'
  }

  const getBoton = () => {
    if (salidaADuplicar) return 'Crear duplicado'
    if (salidaSeleccionada) return 'Guardar cambios'
    return 'Crear salida'
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{getTitulo()}</DialogTitle>
        <DialogContent dividers>
          <FormularioSalida
            key={salidaSeleccionada?.id ?? salidaADuplicar?.id ?? 'new'} // fuerza remonte al cambiar
            salida={formData}
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} variant="outlined">
            Cancelar
          </Button>
          <Button type="submit" variant="contained">
            {getBoton()}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

/** Convierte varias variantes ('YYYY-MM-DD', 'DD-MM-YYYY', 'YYYY-MM-DDTHH:mm:ss') a 'YYYY-MM-DD' para inputs date */
function toInputDate(v?: string | null): string {
  if (!v) return ''
  const raw = v.includes('T') ? v.split('T')[0] : v
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw // ya OK
  if (/^\d{2}-\d{2}-\d{4}$/.test(raw)) {
    const [dd, mm, yyyy] = raw.split('-')
    return `${yyyy}-${mm}-${dd}`
  }
  return ''
}

// ✅ Limpia todos los campos de tramos si no corresponde enviarlos
function limpiarCamposDeVueloSiNoCorresponde(salida: Salida): Salida {
  if (salida.tipo_transporte !== 'sin_transporte') return salida

  const camposVuelo: (keyof Salida)[] = [
    'ida_origen_fecha', 'ida_origen_hora', 'ida_origen_ciudad',
    'ida_destino_fecha', 'ida_destino_hora', 'ida_destino_ciudad',
    'ida_clase_vuelo', 'ida_linea_aerea', 'ida_vuelo', 'ida_escalas',
    'vuelta_origen_fecha', 'vuelta_origen_hora', 'vuelta_origen_ciudad',
    'vuelta_destino_fecha', 'vuelta_destino_hora', 'vuelta_destino_ciudad',
    'vuelta_clase_vuelo', 'vuelta_linea_aerea', 'vuelta_vuelo', 'vuelta_escalas',
  ]

  const salidaLimpia = { ...salida }
  for (const campo of camposVuelo) {
    (salidaLimpia as Record<keyof Salida, unknown>)[campo] = null
  }

  return salidaLimpia as Salida
}

function getInitialSalida(): Salida {
  return {
    id: 0,
    paquete_id: 0,
    salida_externo_id: null,

    venta_online: false,
    cupos: 0,

    fecha_viaje: '',
    fecha_desde: '',
    fecha_hasta: '',

    info_tramos: false,

    tipo_transporte: 'sin_transporte',

    ida_origen_fecha: '',
    ida_origen_hora: null,
    ida_origen_ciudad: null,

    ida_destino_fecha: null,
    ida_destino_hora: null,
    ida_destino_ciudad: null,

    ida_clase_vuelo: null,
    ida_linea_aerea: null,
    ida_vuelo: null,
    ida_escalas: null,

    vuelta_origen_fecha: null,
    vuelta_origen_hora: null,
    vuelta_origen_ciudad: null,

    vuelta_destino_fecha: null,
    vuelta_destino_hora: null,
    vuelta_destino_ciudad: null,

    vuelta_clase_vuelo: null,
    vuelta_linea_aerea: null,
    vuelta_vuelo: null,
    vuelta_escalas: null,

    single_precio: 0,
    single_impuesto: 0,
    single_otro: 0,
    single_otro2: 0,

    doble_precio: 0,
    doble_impuesto: 0,
    doble_otro: 0,
    doble_otro2: 0,

    triple_precio: 0,
    triple_impuesto: 0,
    triple_otro: 0,
    triple_otro2: 0,

    cuadruple_precio: 0,
    cuadruple_impuesto: 0,
    cuadruple_otro: 0,
    cuadruple_otro2: 0,

    familia_1_precio: 0,
    familia_1_impuesto: 0,
    familia_1_otro: 0,
    familia_1_otro2: 0,

    familia_2_precio: 0,
    familia_2_impuesto: 0,
    familia_2_otro: 0,
    familia_2_otro2: 0,

    created_at: '',
    updated_at: ''
  }
}
