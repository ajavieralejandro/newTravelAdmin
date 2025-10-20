// src/mirage/init-mock.ts

import { makeServer } from '../mirage/handler'; // Asegurate que `handler.ts` sea el archivo con makeServer

let server: any;

export function initMock() {
  console.log('🌐 initMock(): ejecutando');

  if (typeof window === 'undefined') {
    console.log('🛑 Mirage no se ejecuta en SSR');
    return;
  }

  if (server) {
    console.log('⚠️ Mirage ya fue inicializado. Se evita doble creación.');
    return server;
  }

  const useMock = process.env.NEXT_PUBLIC_MOCK === 'true';

  if (useMock) {
    console.log('🚀 Iniciando Mirage JS...');
    server = makeServer({ environment: 'development' });
  } else {
    console.log('⛔ Mirage está desactivado por configuración.');
  }

  return server;
}
