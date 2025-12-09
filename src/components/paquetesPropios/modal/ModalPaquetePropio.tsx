'use client'

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material'
import { usePaquetesPropios } from '@/contexts/features/PaquetesPropiosProvider/usePaquetesPropios'
import { FormEvent } from 'react'
import FormularioPaquetePropio from './FormularioPaquetePropio'
import {
  crearPaquetePropio,
  // editarPaquetePropio   // ya no lo usamos acá
} from '@/components/paquetesPropios/paquetespropiosService'
import { PaquetePropio } from '@/types/PaquetePropio'
import { Hotel } from '@/types/Hotel'

/* ---------- API config para la ruta nueva ---------- */
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'https://travelconnect.com.ar/api'

function limpiarParaDuplicar(paquete: PaquetePropio): Partial<PaquetePropio> {
  const { id, slug, ...rest } = paquete
  return {
    ...rest,
    titulo: paquete.titulo + ' (copia)',
    activo: true
  }
}

export default function ModalPaquetePropio() {
  const {
    modalAbierto,
    cerrarModal,
    paqueteSeleccionado,
    paqueteADuplicar,
    fetchPaquetesDeAgencia,
    idAgenciaEnCreacion
  } = usePaquetesPropios()

  const isEditando = Boolean(paqueteSeleccionado)
  const isDuplicando = Boolean(paqueteADuplicar)

  const paqueteInicial = isDuplicando
    ? limpiarParaDuplicar(paqueteADuplicar!)
    : paqueteSeleccionado

  console.log('📦 Paquete inicial para formulario:', paqueteInicial)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget as HTMLFormElement
    const anyForm = form as any

    if (!anyForm.titulo?.value) {
      alert('El título es obligatorio.')
      return
    }

    // Solo exigimos agencia en creación cuando es nuevo / duplicado
    if (!idAgenciaEnCreacion && !isEditando) {
      alert('Error: faltó seleccionar la agencia.')
      return
    }

    const hotel: Hotel = {
      id_hotel: '0',
      nombre: anyForm.hotel_nombre?.value || '',
      categoria_hotel: anyForm.hotel_categoria?.value || '3'
    }

    if (!hotel.nombre) {
      alert('El nombre del hotel es obligatorio.')
      return
    }

    const formData = new FormData()
    formData.append('titulo', anyForm.titulo.value)
    formData.append('descripcion', anyForm.descripcion.value)
    formData.append('pais', anyForm.pais.value)
    formData.append('ciudad', anyForm.ciudad.value)
    formData.append('ciudad_iata', '')
    formData.append('fecha_vigencia_desde', anyForm.fecha_inicio.value)
    formData.append('fecha_vigencia_hasta', anyForm.fecha_fin.value)
    formData.append('cant_noches', anyForm.noches.value)
    formData.append('tipo_producto', 'Vacacional')
    formData.append('activo', anyForm.estado.value === 'activo' ? '1' : '0')
    formData.append('edad_menores', '0')
    formData.append('transporte', 'Aéreo')
    formData.append('tipo_moneda', anyForm.moneda.value)
    formData.append('descuento', '0')

    // Hotel como JSON
    formData.append('hotel', JSON.stringify(hotel))

    // Prioridad
    formData.append('prioridad', anyForm.prioridad.value)

    // Componentes por ahora vacío
    formData.append('componentes', '[]')

    // ✅ Categorías: usamos el hidden generado en FormularioPaquetePropio
    const categoriasJson = anyForm.categorias?.value || '[]'
    formData.append('categorias', categoriasJson)

    // Galería (vacía por ahora)
    formData.append('galeria_imagenes', '[]')

    // agencia_id para creación
    if (!isEditando && idAgenciaEnCreacion) {
      formData.append('agencia_id', idAgenciaEnCreacion)
    }

    // Imagen principal
    if (anyForm.imagen_principal?.files?.[0]) {
      formData.append('imagen_principal', anyForm.imagen_principal.files[0])
    } else if (isDuplicando && paqueteADuplicar?.imagen_principal) {
      formData.append('imagen_principal', paqueteADuplicar.imagen_principal)
    } else if (!isEditando) {
      formData.append('imagen_principal', 'default-package.jpg')
    }

    try {
      if (isEditando && paqueteSeleccionado?.id) {
        // ✅ EDITAR → nuevo endpoint:
        // PUT api/agencias/{agenciaId}/paquetes/{paqueteId}
        const agenciaId = (paqueteSeleccionado as any).usuario_id
        const paqueteId = paqueteSeleccionado.id

        if (!agenciaId) {
          alert('No se encontró usuario_id/agencia en el paquete seleccionado.')
          return
        }

        formData.append('_method', 'PUT') // method spoofing de Laravel

        const res = await fetch(
          `${API_BASE_URL}/agencias/${agenciaId}/paquetes/${paqueteId}`,
          {
            method: 'POST', // Laravel lo trata como PUT por _method
            headers: {
              Accept: 'application/json'
              // NO seteamos Content-Type, el browser lo hace para multipart
            },
            body: formData
          }
        )

        const data = await res.json()

        if (!res.ok) {
          console.error('Error al actualizar paquete por API', data)
          alert('Error al actualizar el paquete (API). Revisa la consola.')
          return
        }

        console.log('✅ Paquete actualizado vía API', data)
      } else {
        // ✅ CREAR / DUPLICAR → sigue usando tu servicio actual
        await crearPaquetePropio(formData)
      }

      if (idAgenciaEnCreacion) {
        await fetchPaquetesDeAgencia(idAgenciaEnCreacion)
      }

      cerrarModal()
    } catch (error) {
      console.error(error)
      alert('Ocurrió un error al guardar el paquete.')
    }
  }

  return (
    <Dialog open={modalAbierto} onClose={cerrarModal} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {isEditando
            ? 'Editar paquete propio'
            : isDuplicando
            ? 'Duplicar paquete'
            : 'Crear nuevo paquete propio'}
        </DialogTitle>
        <DialogContent>
          <FormularioPaquetePropio
            key={paqueteInicial?.id ?? 'nuevo'}
            paquete={paqueteInicial ?? undefined}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={cerrarModal}>Cancelar</Button>
          <Button type="submit" variant="contained">
            {isEditando
              ? 'Guardar cambios'
              : isDuplicando
              ? 'Crear duplicado'
              : 'Crear paquete'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
