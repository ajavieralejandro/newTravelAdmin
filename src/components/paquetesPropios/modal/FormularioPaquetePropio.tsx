'use client'

import React, { useState, useEffect, useMemo } from 'react'
import {
  Box,
  TextField,
  MenuItem,
  Rating,
  Typography,
  Chip,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  useTheme,
  FormHelperText
} from '@mui/material'
import { PaquetePropio } from '@/types/PaquetePropio'
import { Hotel } from '@/types/Hotel'
import BotonAgregarImagen from './BotonAgregarImagen'
import CheckIcon from '@mui/icons-material/Check'

/* ---------- API config ---------- */
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'https://travelconnect.com.ar/api'

// categorías
const CATEGORIAS_ENDPOINT = `${API_BASE_URL}/paquetes/categorias`

/* ---------- MUI Select styles ---------- */
const ITEM_HEIGHT = 48
const ITEM_PADDING_TOP = 8
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250
    }
  }
}

/* ---------- types ---------- */
interface CategoriaApi {
  id: number
  slug: string
  nombre: string
  icono?: string | null
}

const convertirFecha = (fecha?: string) => {
  if (!fecha) return ''
  const [dd, mm, yyyy] = fecha.split('-')
  return dd && mm && yyyy ? `${yyyy}-${mm}-${dd}` : ''
}

const toAbsoluteUrl = (url?: string): string => {
  if (!url) return ''
  if (/^https?:\/\//i.test(url)) return url
  const base = 'https://travelconnect.com.ar'
  return `${base}/${url.replace(/^\/+/, '')}`
}

/* ---------- props ---------- */
interface FormularioPaquetePropioProps {
  paquete?: Partial<PaquetePropio> | null
}

export default function FormularioPaquetePropio({ paquete }: FormularioPaquetePropioProps) {
  const theme = useTheme()
  const [moneda, setMoneda] = useState('ARS')
  const [estado, setEstado] = useState<'activo' | 'inactivo'>('inactivo')
  const [prioridad, setPrioridad] = useState<'alta' | 'media' | 'baja'>('media')

  const [hotel, setHotel] = useState<Hotel>({
    id_hotel: '',
    nombre: '',
    categoria_hotel: '3'
  })

  const [categoriasDisponibles, setCategoriasDisponibles] = useState<CategoriaApi[]>([])
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState<string[]>([])
  const [loadingCategorias, setLoadingCategorias] = useState(false)

  /* ---------- fetch de categorías ---------- */
  useEffect(() => {
    let cancelado = false

    const cargarCategorias = async () => {
      setLoadingCategorias(true)
      try {
        const res = await fetch(CATEGORIAS_ENDPOINT, {
          headers: {
            Accept: 'application/json'
          }
        })

        if (!res.ok) {
          console.error('Error al cargar categorías', await res.text())
          return
        }

        const data = await res.json()
        const items: CategoriaApi[] = Array.isArray(data)
          ? data
          : Array.isArray(data.data)
          ? data.data
          : []

        if (!cancelado) {
          setCategoriasDisponibles(items)
        }
      } catch (err) {
        console.error('Error de red al cargar categorías', err)
      } finally {
        if (!cancelado) {
          setLoadingCategorias(false)
        }
      }
    }

    cargarCategorias()
    return () => {
      cancelado = true
    }
  }, [])

  /* ---------- sync con paquete ---------- */
  useEffect(() => {
    if (paquete?.tipo_moneda) setMoneda(paquete.tipo_moneda)

    if (typeof paquete?.activo === 'boolean') {
      setEstado(paquete.activo ? 'activo' : 'inactivo')
    }

    if (paquete?.prioridad) {
      setPrioridad(paquete.prioridad as 'alta' | 'media' | 'baja')
    }

    // hotel viene como hoteles.hotel desde el back
    const hotelBack: any = (paquete as any)?.hoteles?.hotel
    if (hotelBack) {
      setHotel({
        id_hotel: hotelBack.id_hotel || '',
        nombre: hotelBack.nombre || '',
        categoria_hotel: hotelBack.categoria_hotel || '3'
      })
    }

    // categorías
    if ((paquete as any)?.categorias) {
      const rawCats = (paquete as any).categorias
      let slugs: string[] = []

      if (Array.isArray(rawCats)) {
        slugs = rawCats
          .map((c) => {
            if (typeof c === 'string') return c
            if (c && typeof c === 'object') {
              return c.slug || c.nombre || c.label || ''
            }
            return ''
          })
          .filter((s: string) => s && typeof s === 'string')
      } else if (typeof rawCats === 'string') {
        try {
          const parsed = JSON.parse(rawCats)
          if (Array.isArray(parsed)) {
            slugs = parsed
              .map((c: any) => c.slug || c.nombre || c.label || '')
              .filter((s: string) => s && typeof s === 'string')
          }
        } catch {
          // ignoramos si no es JSON válido
        }
      }

      setCategoriasSeleccionadas(slugs)
    } else {
      setCategoriasSeleccionadas([])
    }
  }, [
    paquete?.tipo_moneda,
    paquete?.activo,
    paquete?.prioridad,
    (paquete as any)?.hoteles,
    (paquete as any)?.categorias
  ])

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

  /* ---------- manejo categorías ---------- */
  const handleCategoriasChange = (event: any) => {
    const value = event.target.value
    const newValue = Array.isArray(value) ? value : []
    setCategoriasSeleccionadas(newValue)
  }

  const handleDeleteCategoria = (slugToDelete: string) => {
    setCategoriasSeleccionadas((prev) => prev.filter((slug) => slug !== slugToDelete))
  }

  const categoriasParaRender = Array.isArray(categoriasSeleccionadas)
    ? categoriasSeleccionadas
    : []

  const categoriasJson = useMemo(() => {
    const seleccionadas = Array.isArray(categoriasSeleccionadas)
      ? categoriasSeleccionadas
      : []

    const full = seleccionadas.map((slug) => {
      const def = categoriasDisponibles.find((c) => c.slug === slug)
      return {
        slug,
        label: def?.nombre ?? slug,
        color: null
      }
    })
    return JSON.stringify(full)
  }, [categoriasSeleccionadas, categoriasDisponibles])

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
        onChange={(e) => setEstado(e.target.value as 'activo' | 'inactivo')}
      >
        <MenuItem value="activo">Activo</MenuItem>
        <MenuItem value="inactivo">Inactivo</MenuItem>
      </TextField>

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

      {/* CATEGORÍAS */}
      <Box mt={3} mb={2}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom color="primary">
          Categorías del Paquete
        </Typography>

        <FormControl fullWidth margin="dense">
          <InputLabel id="categorias-label">Seleccionar categorías</InputLabel>
          <Select
            labelId="categorias-label"
            id="categorias_select"
            name="categorias_select"
            multiple
            value={categoriasParaRender}
            onChange={handleCategoriasChange}
            input={<OutlinedInput label="Seleccionar categorías" />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((slug) => {
                  const categoria = categoriasDisponibles.find(
                    (c) => c.slug === slug
                  )
                  return (
                    <Chip
                      key={slug}
                      label={categoria?.nombre || slug}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  )
                })}
              </Box>
            )}
            MenuProps={MenuProps}
            disabled={loadingCategorias}
          >
            {loadingCategorias ? (
              <MenuItem disabled>
                <Typography color="text.secondary">
                  Cargando categorías...
                </Typography>
              </MenuItem>
            ) : categoriasDisponibles.length === 0 ? (
              <MenuItem disabled>
                <Typography color="text.secondary">
                  No hay categorías disponibles
                </Typography>
              </MenuItem>
            ) : (
              categoriasDisponibles.map((cat) => (
                <MenuItem key={cat.id} value={cat.slug}>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    width="100%"
                  >
                    <Typography>{cat.nombre}</Typography>
                    {categoriasParaRender.includes(cat.slug) && (
                      <CheckIcon fontSize="small" color="primary" />
                    )}
                  </Box>
                </MenuItem>
              ))
            )}
          </Select>
          <FormHelperText>
            Puedes seleccionar múltiples categorías (
            {categoriasParaRender.length} seleccionadas)
          </FormHelperText>
        </FormControl>

        {/* Hidden para que el modal lo lea y lo mande al back */}
        <input type="hidden" name="categorias" value={categoriasJson} />
      </Box>

      {imagenBackUrl && (
        <Box my={2}>
          <Typography variant="subtitle2" gutterBottom>
            Imagen actual
          </Typography>
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

      <BotonAgregarImagen name="imagen_principal" />
    </>
  )
}
