'use client'

import {
  Box,
  TextField,
  MenuItem,
  Rating,
  Typography
} from '@mui/material'
import { useState, useEffect, useMemo } from 'react'
import { PaquetePropio } from '@/types/PaquetePropio'
import { Hotel } from '@/types/Hotel'
import BotonAgregarImagen from './BotonAgregarImagen'

/* ---------- utils ---------- */
const convertirFecha = (fecha?: string) => {
  if (!fecha) return ''
  const [dd, mm, yyyy] = fecha.split('-')
  return dd && mm && yyyy ? `${yyyy}-${mm}-${dd}` : ''
}

/** Si el back devuelve un path relativo, lo convierto a absoluto */
const toAbsoluteUrl = (url?: string): string => {
  if (!url) return ''
  // ya es absoluta
  if (/^https?:\/\//i.test(url)) return url
  // normalizo slash
  const base = 'https://travelconnect.com.ar'
  return `${base}/${url.replace(/^\/+/, '')}`
}

/* ---------- props ---------- */
interface FormularioPaquetePropioProps {
  paquete?: Partial<PaquetePropio> | null
}

/* ---------- component ---------- */
export default function FormularioPaquetePropio({
  paquete
}: FormularioPaquetePropioProps) {
  const [moneda, setMoneda] = useState('ARS')
  const [estado, setEstado] = useState('inactivo')
  const [prioridad, setPrioridad] = useState<'alta' | 'media' | 'baja'>('media')

  const [hotel, setHotel] = useState<Hotel>({
    id_hotel: '',
    nombre: '',
    categoria_hotel: '3'
  })

  /* ---------- sync con paquete ---------- */
  useEffect(() => {
    if (paquete?.tipo_moneda) setMoneda(paquete.tipo_moneda)
    if (typeof paquete?.activo === 'boolean') {
      setEstado(paquete.activo ? 'activo' : 'inactivo')
    }
    if (paquete?.prioridad) setPrioridad(paquete.prioridad)
    if (paquete?.hotel) {
      setHotel({
        id_hotel: paquete.hotel.id_hotel || '',
        nombre: paquete.hotel.nombre || '',
        categoria_hotel: paquete.hotel.categoria_hotel || '3'
      })
    }
  }, [paquete?.hotel, paquete?.tipo_moneda, paquete?.activo, paquete?.prioridad])

  /* ---------- fechas formateadas ---------- */
  const fechaInicioFormateada = useMemo(
    () => convertirFecha(paquete?.fecha_vigencia_desde),
    [paquete?.fecha_vigencia_desde]
  )
  const fechaFinFormateada = useMemo(
    () => convertirFecha(paquete?.fecha_vigencia_hasta),
    [paquete?.fecha_vigencia_hasta]
  )

  /* ---------- imagen del back (preview) ---------- */
  const imagenBackUrl = useMemo(() => {
    const raw = paquete?.imagen_principal as string | undefined
    if (!raw) return ''
    return toAbsoluteUrl(raw)
  }, [paquete])

  return (
    <>
      {/* datos básicos */}
      <TextField
        id="titulo"
        name="titulo"
        label="Título"
        required
        fullWidth
        margin="dense"
        defaultValue={paquete?.titulo || ''}
      />

      <TextField
        id="descripcion"
        name="descripcion"
        label="Descripción"
        required
        fullWidth
        multiline
        rows={4}
        margin="dense"
        defaultValue={paquete?.descripcion || ''}
      />

      <TextField
        id="ciudad"
        name="ciudad"
        label="Ciudad"
        required
        fullWidth
        margin="dense"
        defaultValue={paquete?.ciudad || ''}
      />
      <TextField
        id="pais"
        name="pais"
        label="País"
        required
        fullWidth
        margin="dense"
        defaultValue={paquete?.pais || ''}
      />

      <TextField
        id="noches"
        name="noches"
        label="Cantidad de noches"
        type="number"
        required
        fullWidth
        margin="dense"
        defaultValue={paquete?.cant_noches || ''}
      />

      {/* hotel */}
      <TextField
        id="hotel_nombre"
        name="hotel_nombre"
        label="Nombre del Hotel"
        required
        fullWidth
        margin="dense"
        value={hotel.nombre}
        onChange={(e) =>
          setHotel((prev) => ({ ...prev, nombre: e.target.value }))
        }
      />

      <TextField
        id="hotel_categoria"
        name="hotel_categoria"
        label="Categoría del Hotel"
        required
        fullWidth
        margin="dense"
        value={hotel.categoria_hotel}
        onChange={(e) =>
          setHotel((prev) => ({ ...prev, categoria_hotel: e.target.value }))
        }
      />

      <Box display="flex" alignItems="center" gap={2} my={1}>
        <Typography variant="subtitle2">Estrellas:</Typography>
        <Rating
          name="rating"
          value={parseInt(hotel.categoria_hotel) || 0}
          max={5}
          onChange={(_, newValue) =>
            setHotel((prev) => ({
              ...prev,
              categoria_hotel: newValue?.toString() || '0'
            }))
          }
        />
      </Box>

      <TextField
        id="moneda"
        name="moneda"
        label="Moneda"
        select
        required
        fullWidth
        margin="dense"
        value={moneda}
        onChange={(e) => setMoneda(e.target.value)}
      >
        <MenuItem value="ARS">ARS</MenuItem>
        <MenuItem value="USD">USD</MenuItem>
      </TextField>

      <TextField
        id="fecha_inicio"
        name="fecha_inicio"
        label="Fecha desde"
        type="date"
        required
        fullWidth
        margin="dense"
        defaultValue={fechaInicioFormateada}
        InputLabelProps={{ shrink: true }}
      />

      <TextField
        id="fecha_fin"
        name="fecha_fin"
        label="Fecha hasta"
        type="date"
        required
        fullWidth
        margin="dense"
        defaultValue={fechaFinFormateada}
        InputLabelProps={{ shrink: true }}
      />

      <TextField
        id="estado"
        name="estado"
        label="Estado"
        select
        required
        fullWidth
        margin="dense"
        value={estado}
        onChange={(e) => setEstado(e.target.value)}
      >
        <MenuItem value="activo">Activo</MenuItem>
        <MenuItem value="inactivo">Inactivo</MenuItem>
      </TextField>

      {/* NUEVO CAMPO: PRIORIDAD */}
      <TextField
        id="prioridad"
        name="prioridad"
        label="Prioridad"
        select
        required
        fullWidth
        margin="dense"
        value={prioridad}
        onChange={(e) =>
          setPrioridad(e.target.value as 'alta' | 'media' | 'baja')
        }
      >
        <MenuItem value="alta">Alta</MenuItem>
        <MenuItem value="media">Media</MenuItem>
        <MenuItem value="baja">Baja</MenuItem>
      </TextField>

      {/* PREVIEW de imagen actual si viene del backend */}
      {imagenBackUrl && (
        <Box my={2}>
          <Typography variant="subtitle2" gutterBottom>Imagen actual</Typography>
          <Box
            component="img"
            src={imagenBackUrl}
            alt="Imagen principal del paquete"
            sx={{
              width: '100%',
              maxWidth: 480,
              height: 'auto',
              borderRadius: 2,
              display: 'block',
              objectFit: 'cover',
              boxShadow: 1
            }}
          />
        </Box>
      )}

      {/* Selector para reemplazar/añadir imagen */}
      <BotonAgregarImagen name="imagen_principal" />
    </>
  )
}
