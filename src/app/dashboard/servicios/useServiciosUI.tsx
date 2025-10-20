'use client';

import { useMemo, useState } from 'react';
import { useUserContext } from '@/contexts/user-context';

export function useServiciosUI() {
  const { user } = useUserContext();

  const SECCIONES = useMemo(() => {
    // Podés condicionar por rol si hiciera falta (p.ej. ocultar algo a admins)
    // const esSuperadmin = user?.rol === 'superadmin';
    return [
      'APIs de terceros',
      'Paquetes propios',
      'CRM Atlas',
      'Hotelería',
      'Circuitos',
      'Vuelos',
      'MercadoPago',
    ];
  }, [user?.rol]);

  const [seccionActiva, setSeccionActiva] = useState(SECCIONES[0]);

  const seccionHabilitada = (_: string) => true; // todas habilitadas por ahora

  return {
    secciones: SECCIONES,
    seccionActiva,
    setSeccionActiva,
    seccionHabilitada,
  };
}
