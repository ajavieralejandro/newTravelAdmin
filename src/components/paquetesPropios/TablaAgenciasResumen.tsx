'use client';

import {
  Box,
  CircularProgress,
  Collapse,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import { CaretDown, CaretRight } from '@phosphor-icons/react';
import { Fragment, useState } from 'react';

import { useAgenciasContext } from '@/contexts/features/Agencias/AgenciaProvider';
import { useFetchPaquetesDeAgencia } from '@/contexts/features/PaquetesPropiosProvider/queris/useFetchPaquetesDeAgencia';
import { SubtablaPaquetes } from './SubtablaPaquetes';

function ensureHttp(u?: string | null): string | undefined {
  if (!u) return undefined;
  return /^https?:\/\//i.test(u) ? u : `https://${u}`;
}

function getHrefFromAgencia(agencia: any): string | undefined {
  if (agencia?.url) return ensureHttp(agencia.url);
  if (agencia?.dominio) return ensureHttp(agencia.dominio);
  return undefined;
}

export function TablaAgenciasResumen(): React.JSX.Element {
  const {
    state: { agencias, loading, error }
  } = useAgenciasContext();

  // Solo una fila abierta a la vez
  const [openId, setOpenId] = useState<string | null>(null);
  const { cargarSiNoExiste } = useFetchPaquetesDeAgencia();

  const toggleRow = (id: string | null) => {
    if (!id) return;
    setOpenId(prev => {
      const next = prev === id ? null : id;
      if (next && next !== prev) cargarSiNoExiste(next);
      return next;
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" variant="body2">
        Error al cargar agencias: {error}
      </Typography>
    );
  }

  if (!agencias || agencias.length === 0) {
    return (
      <Typography variant="body1" color="text.secondary">
        No se encontraron agencias.
      </Typography>
    );
  }

  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>Logo</TableCell>
            <TableCell>Nombre</TableCell>
            <TableCell>Dominio</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {agencias.map((agencia: any) => {
            // Id seguro (evita que 'undefined' abra todas las filas)
            const safeId =
              agencia?.agencia_id ??
              agencia?.idAgencia ??
              agencia?.id ??
              null;

            const idStr = safeId !== null ? String(safeId) : null;

            const href = getHrefFromAgencia(agencia);
            const label = agencia?.dominio || agencia?.url || 'Sin dominio';
            const isOpen = !!idStr && openId === idStr;

            return (
              <Fragment key={idStr ?? `agencia-row-${Math.random()}`}>
                <TableRow hover>
                  <TableCell width="64px">
                    <IconButton
                      onClick={() => toggleRow(idStr)}
                      disabled={!idStr}
                      aria-label={isOpen ? 'Contraer paquetes' : 'Expandir paquetes'}
                    >
                      {isOpen ? <CaretDown /> : <CaretRight />}
                    </IconButton>
                  </TableCell>
                  <TableCell>
                    {agencia?.logo ? (
                      <Box
                        component="img"
                        src={agencia.logo}
                        alt={agencia?.nombre || 'Agencia'}
                        sx={{ width: 40, height: 40, borderRadius: 1, objectFit: 'cover' }}
                      />
                    ) : (
                      <Box sx={{ width: 40, height: 40, borderRadius: 1, bgcolor: 'action.hover' }} />
                    )}
                  </TableCell>
                  <TableCell>{agencia?.nombre || 'Sin nombre'}</TableCell>
                  <TableCell>
                    {href ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#1976d2', textDecoration: 'underline' }}
                        title={href}
                        aria-label={`Abrir sitio de ${agencia?.nombre ?? 'agencia'}`}
                      >
                        {label}
                      </a>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Sin dominio
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={4} sx={{ p: 0, border: 0 }}>
                    <Collapse in={isOpen} timeout="auto" unmountOnExit>
                      <Box sx={{ p: 2 }}>
                        {idStr && (
                          <SubtablaPaquetes
                            agenciaId={idStr}
                            nombreAgencia={agencia.nombre}
                          />
                        )}
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </Fragment>
            );
          })}
        </TableBody>
      </Table>
    </Box>
  );
}
