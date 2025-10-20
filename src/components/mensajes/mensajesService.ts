// components/mensajes/mensajesService.ts
'use client';

import * as React from 'react';
import { authFetch } from '@/lib/auth/authFetch';
import { useUserContext } from '@/contexts/user-context';
import type { Consulta, Reserva, EmailRegistrado } from '@/types/Mensajes';

type PageParams = { page?: number; perPage?: number };
type ListResp<T> = {
  items: T[];
  page: number;
  perPage: number;
  total: number;
  hasNext: boolean;
  hasPrev: boolean;
};

function mapLaravelPagination<T>(raw: any): ListResp<T> {
  const p = raw?.data;
  const page = Number(p?.current_page ?? 1);
  const perPage = Number(p?.per_page ?? 10);
  const total = Number(p?.total ?? 0);
  const hasNext = Boolean(p?.next_page_url);
  const hasPrev = Boolean(p?.prev_page_url);
  const items: T[] = Array.isArray(p?.data) ? p.data : [];
  return { items, page, perPage, total, hasNext, hasPrev };
}

async function fetchLista<T>(
  endpoint: string,
  agenciaId: number,
  { page = 1, perPage = 10 }: PageParams = {}
): Promise<ListResp<T>> {
  const qs = new URLSearchParams();
  if (perPage) qs.set('per_page', String(perPage));
  if (page) qs.set('page', String(page));

  const url = `${endpoint}/${agenciaId}?${qs.toString()}`;
  const res = await authFetch(url, { method: 'GET' });

  if (!res.ok) {
    if (res.status === 404) throw new Error('Agencia no encontrada');
    throw new Error('Error al obtener datos');
  }

  const json = await res.json();
  return mapLaravelPagination<T>(json);
}

async function fetchListaSubresource<T>(
  base: string,
  agenciaId: number,
  sub: string,
  { page = 1, perPage = 10 }: PageParams = {}
): Promise<ListResp<T>> {
  const qs = new URLSearchParams();
  if (perPage) qs.set('per_page', String(perPage));
  if (page) qs.set('page', String(page));

  const url = `${base}/${agenciaId}/${sub}?${qs.toString()}`;
  const res = await authFetch(url, { method: 'GET' });

  if (!res.ok) {
    if (res.status === 404) throw new Error('Agencia no encontrada');
    throw new Error('Error al obtener datos');
  }

  const json = await res.json();
  return mapLaravelPagination<T>(json);
}

// --------- API puras ----------
export const getConsultas = (
  agenciaId: number,
  params?: PageParams
): Promise<ListResp<Consulta>> =>
  fetchLista<Consulta>('https://travelconnect.com.ar/consultas', agenciaId, params);

export const getReservas = (
  agenciaId: number,
  params?: PageParams
): Promise<ListResp<Reserva>> =>
  fetchLista<Reserva>('https://travelconnect.com.ar/reservas', agenciaId, params);

export const getEmails = (
  agenciaId: number,
  params?: PageParams
): Promise<ListResp<EmailRegistrado>> =>
  fetchListaSubresource<EmailRegistrado>(
    'https://travelconnect.com.ar/agencias',
    agenciaId,
    'emails',
    { page: params?.page ?? 1, perPage: params?.perPage ?? 15 } // default perPage=15
  );

// --------- Hook con inyección de agencia_id (memoizado) ----------
export function useMensajesApi() {
  const { user } = useUserContext();
  const agenciaId = Number(user?.agencia_id ?? 0);

  const ensureId = React.useCallback(() => {
    if (!agenciaId) throw new Error('Falta agencia_id en el usuario');
    return agenciaId;
  }, [agenciaId]);

  const getConsultasMemo = React.useCallback(
    (params?: PageParams) => getConsultas(ensureId(), params),
    [ensureId]
  );

  const getReservasMemo = React.useCallback(
    (params?: PageParams) => getReservas(ensureId(), params),
    [ensureId]
  );

  const getEmailsMemo = React.useCallback(
    (params?: PageParams) => getEmails(ensureId(), params),
    [ensureId]
  );

  return {
    getConsultas: getConsultasMemo,
    getReservas: getReservasMemo,
    getEmails: getEmailsMemo,
  };
}
