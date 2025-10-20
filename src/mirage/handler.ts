// src/mirage/index.ts
import { createServer } from 'miragejs';
import { agenciaMock} from '../mock/agenciasMock'; // ⬅️ asegurate que esta ruta sea correcta

export function makeServer({ environment = 'development' } = {}) {
  return createServer({
    environment,

    routes() {
      this.namespace = 'api';

      // ✅ Ruta simulada para agencias (GET /api/agencias)
      this.get('/agencias', () => {
        return agenciaMock;
      });

      // ✅ Permitir pasar todo lo demás al backend real
      this.passthrough('https://travelconnect.com.ar/**');
      this.passthrough('https://triptest.com.ar/**');
      this.passthrough();
    },
  });
}
