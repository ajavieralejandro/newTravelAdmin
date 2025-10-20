'use client';

import type { User } from '@/types/user';
import type { AgenciaBackData } from '../../types/AgenciaBackData';

export interface SignInWithPasswordParams {
  email: string;
  password: string;
}

export interface SignUpParams {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

const TOKEN_KEY = 'custom-auth-token';
const USER_KEY = 'usuario';
const AGENCIA_KEY = 'agencia-data';

class AuthClient {
  async signInWithPassword(params: SignInWithPasswordParams): Promise<{ error?: string }> {
    const { email, password } = params;

    const endpoint = 'https://travelconnect.com.ar/agency/login';

    console.log(`🟡 Enviando login a ${endpoint} con:`, params);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('Respuesta del servidor', data);

      if (!response.ok) {
        console.log('🔴 Error de login:', data.error || data.message);
        return { error: data.error || data.message || 'Error desconocido' };
      }

      const token: string = data.access_token;
      const rawUser: AgenciaBackData = data.agencia;
      const agenciaData: AgenciaBackData = data.agencia;

      // Normalizamos ID de agencia desde la respuesta (idAgencia viene como string)
      const idAgencia = String(rawUser.idAgencia);

      // Regla de rol vigente: idAgencia === '13' => superadmin
      const isSuperadmin = idAgencia === '13';

      const user: User = {
        id: idAgencia,
        nombre: rawUser.nombre,
        dominio: rawUser.dominio ?? null,
        rol: isSuperadmin ? 'superadmin' : 'admin',
        agencia_id: isSuperadmin ? undefined : idAgencia,
      };

      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      localStorage.setItem(AGENCIA_KEY, JSON.stringify(agenciaData));

      console.log('🟢 Login exitoso:', user);
      console.log('📊 Datos de agencia:', agenciaData);
      return {};
    } catch (error) {
      console.error('🔴 Error inesperado en login:', error);
      return { error: 'Ocurrió un error inesperado' };
    }
  }

  async signUp(params: SignUpParams): Promise<{ error?: string }> {
    const { email } = params;

    if (email !== 'admin@example.com') {
      localStorage.setItem(TOKEN_KEY, 'fake-token');
      return {};
    }

    return { error: 'Este email ya está en uso' };
  }

  async getUser(): Promise<{ data?: User | null; error?: string }> {
    const token = localStorage.getItem(TOKEN_KEY);
    const userRaw = localStorage.getItem(USER_KEY);

    if (!token) return { data: null, error: 'Token no encontrado' };
    if (!userRaw) return { data: null, error: 'Usuario no encontrado' };

    try {
      const user: User = JSON.parse(userRaw);
      return { data: user };
    } catch {
      return { data: null, error: 'Error al leer usuario' };
    }
  }

  async getAgenciaData(): Promise<{ data?: AgenciaBackData | null; error?: string }> {
    const token = localStorage.getItem(TOKEN_KEY);
    const agenciaRaw = localStorage.getItem(AGENCIA_KEY);

    if (!token) return { data: null, error: 'Token no encontrado' };
    if (!agenciaRaw) return { data: null, error: 'Datos de agencia no encontrados' };

    try {
      const agencia: AgenciaBackData = JSON.parse(agenciaRaw);
      return { data: agencia };
    } catch {
      return { data: null, error: 'Error al leer datos de agencia' };
    }
  }

  async signOut(): Promise<{ error?: string }> {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(AGENCIA_KEY);
    return {};
  }

  // Método opcional para actualizar solo los datos de agencia
  async updateAgenciaData(newData: AgenciaBackData): Promise<{ error?: string }> {
    try {
      localStorage.setItem(AGENCIA_KEY, JSON.stringify(newData));
      return {};
    } catch (error) {
      console.error('🔴 Error al actualizar datos de agencia:', error);
      return { error: 'Error al actualizar datos de agencia' };
    }
  }
}

export const authClient = new AuthClient();
