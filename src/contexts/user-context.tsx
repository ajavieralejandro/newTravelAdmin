'use client';

import * as React from 'react';
import type { User } from '@/types/user';
import type { AgenciaBackData } from '@/types/AgenciaBackData';
import { authClient } from '@/lib/auth/client';

// Mapper UI <-> Back
import {
  mapBackToForm,
  type AgenciaFormValues,
} from '@/contexts/features/Agencias/services/agenciaMapper';

export interface UserContextValue {
  // Estado
  user: User | null;
  agenciaRaw: AgenciaBackData | null;      // datos crudos (back/localStorage)
  agenciaView: AgenciaFormValues | null;   // datos normalizados para la UI
  error: string | null;
  isLoading: boolean;

  // Métodos
  checkSession: () => Promise<void>;
  recargarAgencia: () => Promise<void>;
  patchAgenciaView: (patch: Partial<AgenciaFormValues>) => void;
  actualizarAgenciaLocal: (patch: Partial<AgenciaBackData>) => Promise<void>;
}

export const UserContext = React.createContext<UserContextValue | undefined>(undefined);

export interface UserProviderProps {
  children: React.ReactNode;
}

type State = {
  user: User | null;
  agenciaRaw: AgenciaBackData | null;
  agenciaView: AgenciaFormValues | null;
  error: string | null;
  isLoading: boolean;
};

export function UserProvider({ children }: UserProviderProps): React.JSX.Element {
  const [state, setState] = React.useState<State>({
    user: null,
    agenciaRaw: null,
    agenciaView: null,
    error: null,
    isLoading: true,
  });

  const checkSession = React.useCallback(async (): Promise<void> => {
    console.info('[UserContext] checkSession(): inicio');
    try {
      const { data: user, error: userErr } = await authClient.getUser();

      if (userErr === 'Token no encontrado' || userErr === 'No token found') {
        console.warn('[UserContext] checkSession(): no hay token');
        setState((s) => ({ ...s, user: null, agenciaRaw: null, agenciaView: null, error: null, isLoading: false }));
        return;
      }
      if (userErr) {
        console.error('[UserContext] checkSession(): error usuario →', userErr);
        setState((s) => ({ ...s, user: null, agenciaRaw: null, agenciaView: null, error: 'Something went wrong', isLoading: false }));
        return;
      }

      // Con token, intentamos hidratar agencia
      const { data: agencia, error: agErr } = await authClient.getAgenciaData();
      if (agErr) {
        console.warn('[UserContext] checkSession(): agencia no disponible en local →', agErr);
      }

      const agenciaView = agencia ? mapBackToForm(agencia) : null;

      setState({
        user: user ?? null,
        agenciaRaw: agencia ?? null,
        agenciaView,
        error: null,
        isLoading: false,
      });

      console.info('[UserContext] checkSession(): OK', { user, agenciaRaw: agencia, agenciaView });
    } catch (err) {
      console.error('[UserContext] checkSession(): excepción', err);
      setState({ user: null, agenciaRaw: null, agenciaView: null, error: 'Something went wrong', isLoading: false });
    }
  }, []);

  const recargarAgencia = React.useCallback(async (): Promise<void> => {
    console.info('[UserContext] recargarAgencia(): inicio');
    try {
      const { data: agencia, error } = await authClient.getAgenciaData();
      if (error) {
        console.warn('[UserContext] recargarAgencia(): sin datos en local →', error);
        setState((s) => ({ ...s, agenciaRaw: null, agenciaView: null }));
        return;
      }
      const agenciaView = agencia ? mapBackToForm(agencia) : null;
      setState((s) => ({ ...s, agenciaRaw: agencia ?? null, agenciaView }));
      console.info('[UserContext] recargarAgencia(): OK', { agenciaRaw: agencia, agenciaView });
    } catch (err) {
      console.error('[UserContext] recargarAgencia(): excepción', err);
    }
  }, []);

  const patchAgenciaView = React.useCallback((patch: Partial<AgenciaFormValues>): void => {
    setState((s) => {
      const nextView = s.agenciaView ? { ...s.agenciaView, ...patch } : null;
      console.info('[UserContext] patchAgenciaView(): patch aplicado', { patch, nextView });
      return { ...s, agenciaView: nextView };
    });
  }, []);

  /**
   * Actualiza la AGENCIA cruda (localStorage) y re-deriva la vista para UI.
   * Útil para sincronizar tras un guardado parcial o cambios que querés persistir localmente.
   * (No llama al backend; persiste en local usando authClient.updateAgenciaData)
   */
  const actualizarAgenciaLocal = React.useCallback(async (patch: Partial<AgenciaBackData>): Promise<void> => {
    console.info('[UserContext] actualizarAgenciaLocal(): inicio', { patch });
    try {
      setState((s) => {
        const nextRaw: AgenciaBackData | null = s.agenciaRaw
          ? { ...s.agenciaRaw, ...patch }
          : (patch as AgenciaBackData) ?? null;

        if (nextRaw) {
          // persistimos localmente
          authClient.updateAgenciaData(nextRaw).catch((e) =>
            console.error('[UserContext] actualizarAgenciaLocal(): error persistiendo en local', e)
          );
        }

        const nextView = nextRaw ? mapBackToForm(nextRaw) : null;
        console.info('[UserContext] actualizarAgenciaLocal(): OK', { nextRaw, nextView });

        return { ...s, agenciaRaw: nextRaw, agenciaView: nextView };
      });
    } catch (err) {
      console.error('[UserContext] actualizarAgenciaLocal(): excepción', err);
    }
  }, []);

  React.useEffect(() => {
    // Hidrata en el primer render
    checkSession().catch((err: unknown) => {
      console.error('[UserContext] useEffect(checkSession) error:', err);
    });
  }, [checkSession]);

  const value = React.useMemo<UserContextValue>(
    () => ({
      user: state.user,
      agenciaRaw: state.agenciaRaw,
      agenciaView: state.agenciaView,
      error: state.error,
      isLoading: state.isLoading,
      checkSession,
      recargarAgencia,
      patchAgenciaView,
      actualizarAgenciaLocal,
    }),
    [state, checkSession, recargarAgencia, patchAgenciaView, actualizarAgenciaLocal]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUserContext(): UserContextValue {
  const context = React.useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
}
