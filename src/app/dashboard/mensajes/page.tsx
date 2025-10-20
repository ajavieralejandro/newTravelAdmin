// app/dashboard/mensajes/page.tsx
'use client';

import * as React from 'react';
import { Box, Tabs, Tab, Card, CardContent, Typography } from '@mui/material';
import type { Consulta, Reserva, MensajesTab, EmailRegistrado } from '@/types/Mensajes';
import { useMensajesApi } from '@/components/mensajes/mensajesService';
import { useSearchParams, useRouter } from 'next/navigation';
import ConsultasTable from '@/components/mensajes/ConsultasTable';
import ReservasTable from '@/components/mensajes/ReservasTable';
import EmailsTable from '@/components/mensajes/EmailsTable';

type TabIndex = 0 | 1 | 2;
const tabFromIndex = (i: TabIndex): MensajesTab =>
  i === 0 ? 'consultas' : i === 1 ? 'reservas' : 'emails';
const indexFromTab = (t: MensajesTab): TabIndex =>
  t === 'consultas' ? 0 : t === 'reservas' ? 1 : 2;

type State<T> = {
  items: T[];
  page: number;
  perPage: number;
  total: number;
  hasPrev: boolean;
  hasNext: boolean;
  loading: boolean;
  error: string | null;
};

function TabPanel(props: { children?: React.ReactNode; value: number; index: number }) {
  const { children, value, index } = props;
  return value === index ? <Box sx={{ pt: 2 }}>{children}</Box> : null;
}

export default function Page(): React.JSX.Element {
  const { getConsultas, getReservas, getEmails } = useMensajesApi();
  const search = useSearchParams();
  const router = useRouter();

  // ---- URL params (defaults)
  const initialTab: MensajesTab =
    search.get('tab') === 'reservas' ? 'reservas' : search.get('tab') === 'emails' ? 'emails' : 'consultas';
  const pageParam = search.get('page');
  const perPageParam = search.get('per_page');
  const initialPage = Number(pageParam ?? '1') || 1;
  const defaultPerPageFor = (tab: MensajesTab) => (tab === 'emails' ? 15 : 10);
  const initialPerPageResolved = perPageParam ? Number(perPageParam) || 10 : defaultPerPageFor(initialTab);

  const [activeTab, setActiveTab] = React.useState<MensajesTab>(initialTab);

  const [consultasState, setConsultasState] = React.useState<State<Consulta>>({
    items: [],
    page: initialTab === 'consultas' ? initialPage : 1,
    perPage: initialTab === 'consultas' ? initialPerPageResolved : defaultPerPageFor('consultas'),
    total: 0,
    hasPrev: false,
    hasNext: false,
    loading: false,
    error: null,
  });

  const [reservasState, setReservasState] = React.useState<State<Reserva>>({
    items: [],
    page: initialTab === 'reservas' ? initialPage : 1,
    perPage: initialTab === 'reservas' ? initialPerPageResolved : defaultPerPageFor('reservas'),
    total: 0,
    hasPrev: false,
    hasNext: false,
    loading: false,
    error: null,
  });

  const [emailsState, setEmailsState] = React.useState<State<EmailRegistrado>>({
    items: [],
    page: initialTab === 'emails' ? initialPage : 1,
    perPage: initialTab === 'emails' ? initialPerPageResolved : defaultPerPageFor('emails'), // 15
    total: 0,
    hasPrev: false,
    hasNext: false,
    loading: false,
    error: null,
  });

  // ---- URL sync (solo en handlers)
  const pushParams = React.useCallback(
    (tab: MensajesTab, page: number, perPage: number) => {
      const params = new URLSearchParams();
      params.set('tab', tab);
      params.set('page', String(page));
      params.set('per_page', String(perPage));
      router.replace(`?${params.toString()}`);
    },
    [router]
  );

  // ---- Fetch según tab activa
  React.useEffect(() => {
    let ignore = false;
    const run = async () => {
      if (activeTab === 'consultas') {
        const { page, perPage } = consultasState;
        setConsultasState(s => ({ ...s, loading: true, error: null }));
        try {
          const res = await getConsultas({ page, perPage });
          if (ignore) return;
          setConsultasState(s => ({
            ...s,
            items: res.items,
            total: res.total,
            hasPrev: res.hasPrev,
            hasNext: res.hasNext,
            loading: false,
            error: null,
          }));
        } catch (e: any) {
          if (ignore) return;
          setConsultasState(s => ({ ...s, loading: false, error: e?.message ?? 'Error' }));
        }
      } else if (activeTab === 'reservas') {
        const { page, perPage } = reservasState;
        setReservasState(s => ({ ...s, loading: true, error: null }));
        try {
          const res = await getReservas({ page, perPage });
          if (ignore) return;
          setReservasState(s => ({
            ...s,
            items: res.items,
            total: res.total,
            hasPrev: res.hasPrev,
            hasNext: res.hasNext,
            loading: false,
            error: null,
          }));
        } catch (e: any) {
          if (ignore) return;
          setReservasState(s => ({ ...s, loading: false, error: e?.message ?? 'Error' }));
        }
      } else {
        const { page, perPage } = emailsState;
        setEmailsState(s => ({ ...s, loading: true, error: null }));
        try {
          const res = await getEmails({ page, perPage });
          if (ignore) return;
          setEmailsState(s => ({
            ...s,
            items: res.items,
            total: res.total,
            hasPrev: res.hasPrev,
            hasNext: res.hasNext,
            loading: false,
            error: null,
          }));
        } catch (e: any) {
          if (ignore) return;
          setEmailsState(s => ({ ...s, loading: false, error: e?.message ?? 'Error' }));
        }
      }
    };
    run();
    return () => {
      ignore = true;
    };
  }, [
    activeTab,
    consultasState.page,
    consultasState.perPage,
    reservasState.page,
    reservasState.perPage,
    emailsState.page,
    emailsState.perPage,
    getConsultas,
    getReservas,
    getEmails,
  ]);

  // ---- Handlers tabs/paginación (con URL sync)
  const handleTabChange = (_: any, idx: number) => {
    const nextTab = tabFromIndex(idx as TabIndex);
    setActiveTab(nextTab);
    if (nextTab === 'consultas') {
      setConsultasState(s => {
        const next = { ...s, page: 1, perPage: s.perPage || defaultPerPageFor('consultas') };
        pushParams('consultas', next.page, next.perPage);
        return next;
      });
    } else if (nextTab === 'reservas') {
      setReservasState(s => {
        const next = { ...s, page: 1, perPage: s.perPage || defaultPerPageFor('reservas') };
        pushParams('reservas', next.page, next.perPage);
        return next;
      });
    } else {
      setEmailsState(s => {
        const next = { ...s, page: 1, perPage: s.perPage || defaultPerPageFor('emails') };
        pushParams('emails', next.page, next.perPage);
        return next;
      });
    }
  };

  const onConsultasPageChange = (next: number) =>
    setConsultasState(s => {
      const page = Math.max(1, next);
      if (page !== s.page) pushParams('consultas', page, s.perPage);
      return { ...s, page };
    });
  const onConsultasPerPage = (pp: number) =>
    setConsultasState(s => {
      const perPage = pp;
      pushParams('consultas', 1, perPage);
      return { ...s, perPage, page: 1 };
    });

  const onReservasPageChange = (next: number) =>
    setReservasState(s => {
      const page = Math.max(1, next);
      if (page !== s.page) pushParams('reservas', page, s.perPage);
      return { ...s, page };
    });
  const onReservasPerPage = (pp: number) =>
    setReservasState(s => {
      const perPage = pp;
      pushParams('reservas', 1, perPage);
      return { ...s, perPage, page: 1 };
    });

  const onEmailsPageChange = (next: number) =>
    setEmailsState(s => {
      const page = Math.max(1, next);
      if (page !== s.page) pushParams('emails', page, s.perPage);
      return { ...s, page };
    });
  const onEmailsPerPage = (pp: number) =>
    setEmailsState(s => {
      const perPage = pp;
      pushParams('emails', 1, perPage);
      return { ...s, perPage, page: 1 };
    });

  const refreshConsultas = () => setConsultasState(s => ({ ...s, page: s.page }));
  const refreshReservas = () => setReservasState(s => ({ ...s, page: s.page }));
  const refreshEmails = () => setEmailsState(s => ({ ...s, page: s.page }));

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" sx={{ mb: 2 }}>Mensajes</Typography>

        <Tabs
          value={indexFromTab(activeTab)}
          onChange={handleTabChange}
          variant="scrollable"
          allowScrollButtonsMobile
        >
          <Tab label="Consultas" />
          <Tab label="Reservas" />
          <Tab label="Mails registrados" />
        </Tabs>

        <TabPanel value={indexFromTab(activeTab)} index={0}>
          <ConsultasTable
            items={consultasState.items}
            page={consultasState.page}
            perPage={consultasState.perPage}
            total={consultasState.total}
            loading={consultasState.loading}
            error={consultasState.error}
            onPageChange={onConsultasPageChange}
            onPerPageChange={onConsultasPerPage}
            onRefresh={refreshConsultas}
          />
        </TabPanel>

        <TabPanel value={indexFromTab(activeTab)} index={1}>
          <ReservasTable
            items={reservasState.items}
            page={reservasState.page}
            perPage={reservasState.perPage}
            total={reservasState.total}
            loading={reservasState.loading}
            error={reservasState.error}
            onPageChange={onReservasPageChange}
            onPerPageChange={onReservasPerPage}
            onRefresh={refreshReservas}
          />
        </TabPanel>

        <TabPanel value={indexFromTab(activeTab)} index={2}>
          <EmailsTable
            items={emailsState.items}
            page={emailsState.page}
            perPage={emailsState.perPage}
            total={emailsState.total}
            loading={emailsState.loading}
            error={emailsState.error}
            onPageChange={onEmailsPageChange}
            onPerPageChange={onEmailsPerPage}
            onRefresh={refreshEmails}
          />
        </TabPanel>
      </CardContent>
    </Card>
  );
}
