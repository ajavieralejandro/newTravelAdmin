// src/components/ConfigAgencia/useModalServiciosAgencia.ts
'use client';

import { useState } from 'react';

const SECCIONES = [
  'APIs de terceros',
  'Paquetes propios',
  'CRM Atlas',
  'Hotelería',
  'Circuitos',
  'Vuelos',
  'MercadoPago',
];

export function useModalServiciosAgencia() {
  const [seccionActiva, setSeccionActiva] = useState(SECCIONES[0]);

  const seccionHabilitada = (seccion: string) => {
    // Simulación: todas habilitadas por ahora
    return true;
  };

  return {
    secciones: SECCIONES,
    seccionActiva,
    setSeccionActiva,
    seccionHabilitada,
  };
}
