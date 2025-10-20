// src/mirage/index.ts

import { initMock } from '../lib/init-mock';

// ⚙️ Ejecutamos Mirage si corresponde por configuración
if (typeof window !== 'undefined') {
  console.log('[Mirage] Evaluando si iniciar Mirage...');
  initMock();
}
