import { Salida } from '@/types/Salidas';

const API_BASE = 'https://travelconnect.com.ar';

const headers = {
  'Content-Type': 'application/json',
};

// GET /salidas
export async function fetchSalidas(): Promise<Salida[]> {
  const res = await fetch(`${API_BASE}/salidas`, { headers });
  if (!res.ok) throw new Error('Error al obtener las salidas');
  const data = await res.json();
  return data.data;
}

// GET /salidas/{id}
export async function fetchSalidaPorId(id: number): Promise<Salida> {
  const res = await fetch(`${API_BASE}/salidas/${id}`, { headers });
  if (!res.ok) throw new Error('Error al obtener la salida');
  const data = await res.json();
  return data;
}

// POST /salidas
export async function crearSalida(salida: Partial<Salida>): Promise<Salida> {
  const salidaLimpia = { ...salida };
  delete salidaLimpia.id;
  delete salidaLimpia.created_at;
  delete salidaLimpia.updated_at;

  const res = await fetch(`${API_BASE}/salidas`, {
    method: 'POST',
    headers,
    body: JSON.stringify(salidaLimpia),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('[SALIDAS SERVICE] ❌ Error al crear la salida:', errorText);
    throw new Error('Error al crear la salida');
  }

  const data = await res.json();
  return data.data;
}

// PUT /salidas/{id}
export async function editarSalida(id: number, salida: Partial<Salida>): Promise<Salida> {
  const res = await fetch(`${API_BASE}/salidas/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(salida),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('[SALIDAS SERVICE] ❌ Error al actualizar salida:', errorText);
    throw new Error('Error al actualizar la salida');
  }

  const data = await res.json();
  return data.data;
}

// DELETE /salidas/{id}
export async function eliminarSalida(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/salidas/${id}`, {
    method: 'DELETE',
    headers,
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('[SALIDAS SERVICE] ❌ Error al eliminar salida:', errorText);
    throw new Error('Error al eliminar la salida');
  }
}
