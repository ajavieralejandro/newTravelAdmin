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
  editarPaquetePropio
} from '@/components/paquetesPropios/paquetespropiosService'
import { PaquetePropio } from '@/types/PaquetePropio'
import { Hotel } from '@/types/Hotel'

function limpiarParaDuplicar(paquete: PaquetePropio): Partial<PaquetePropio> {
  const { id, slug, ...rest } = paquete
  return {
    ...rest,
    titulo: paquete.titulo + ' (copia)',
    activo: true,
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
    const form = e.currentTarget

    if (!form.titulo?.value) {
      alert('El título es obligatorio.')
      return
    }

    if (!idAgenciaEnCreacion) {
      alert('Error: faltó seleccionar la agencia.')
      return
    }

    const hotel: Hotel = {
      id_hotel: '0',
      nombre: form.hotel_nombre?.value || '',
      categoria_hotel: form.hotel_categoria?.value || '3'
    }

    if (!hotel.nombre) {
      alert('El nombre del hotel es obligatorio.')
      return
    }

    const formData = new FormData()
    formData.append('titulo', form.titulo.value)
    formData.append('descripcion', form.descripcion.value)
    formData.append('pais', form.pais.value)
    formData.append('ciudad', form.ciudad.value)
    formData.append('ciudad_iata', '')
    formData.append('fecha_vigencia_desde', form.fecha_inicio.value)
    formData.append('fecha_vigencia_hasta', form.fecha_fin.value)
    formData.append('cant_noches', form.noches.value)
    formData.append('tipo_producto', 'Vacacional')
    formData.append('activo', form.estado.value === 'activo' ? '1' : '0')
    formData.append('edad_menores', '0')
    formData.append('transporte', 'Aéreo')
    formData.append('tipo_moneda', form.moneda.value)
    formData.append('descuento', '0')

    // ✅ Hotel como JSON
    formData.append('hotel', JSON.stringify(hotel))

    // ✅ Prioridad
    formData.append('prioridad', form.prioridad.value)

    formData.append('componentes', '[]')
    formData.append('categorias', '[]')
    formData.append('galeria_imagenes', '[]')

    // ✅ Enviar agencia_id (no usuario_id)
    formData.append('agencia_id', idAgenciaEnCreacion)

    // ✅ Manejar imagen_principal para duplicación y creación
    if (form.imagen_principal?.files?.[0]) {
      // Si se seleccionó una nueva imagen, usarla
      formData.append('imagen_principal', form.imagen_principal.files[0])
    } else if (isDuplicando && paqueteADuplicar?.imagen_principal) {
      // Si estamos duplicando y existe imagen original, enviar la URL como string
      formData.append('imagen_principal', paqueteADuplicar.imagen_principal)
    } else if (!isEditando) {
      // Si es creación nueva sin imagen, usar imagen por defecto
      formData.append('imagen_principal', 'default-package.jpg')
    }

    try {
      if (isEditando && paqueteSeleccionado?.id) {
        await editarPaquetePropio(paqueteSeleccionado.id, formData)
      } else {
        await crearPaquetePropio(formData)
      }

      await fetchPaquetesDeAgencia(idAgenciaEnCreacion)
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
