// components/dashboard/mensajes/ReservasTable.tsx
'use client';

import * as React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  LinearProgress,
  Alert,
  Button,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Tooltip,
  Collapse,
  Divider,
} from '@mui/material';
import { ArrowLeft, ArrowRight, ArrowClockwise, CaretDown, CaretRight } from '@phosphor-icons/react';
import type { Reserva } from '@/types/Mensajes';

type Pasajero = {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  pasaporte: string | null;
  fecha_nacimiento: string | null;
};

export interface ReservasTableProps {
  items: (Reserva & { pasajeros?: Pasajero[] })[];
  page: number;
  perPage: number;
  total: number;
  loading: boolean;
  error: string | null;
  onPageChange: (nextPage: number) => void;
  onPerPageChange: (nextPerPage: number) => void;
  onRefresh: () => void;
}

export default function ReservasTable({
  items,
  page,
  perPage,
  total,
  loading,
  error,
  onPageChange,
  onPerPageChange,
  onRefresh,
}: ReservasTableProps): React.JSX.Element {
  const totalPages = Math.max(1, Math.ceil(total / Math.max(1, perPage)));
  const canPrev = page > 1;
  const canNext = page < totalPages;

  const [open, setOpen] = React.useState<Set<number>>(new Set());
  const toggle = (id: number) =>
    setOpen(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  return (
    <Card variant="outlined">
      {loading && <LinearProgress />}

      <CardContent>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2, gap: 2 }}>
          <Typography variant="subtitle1">
            Reservas {total ? `• ${total}` : ''}
          </Typography>

          <Stack direction="row" spacing={1} alignItems="center">
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel id="per-page-label">Por página</InputLabel>
              <Select
                labelId="per-page-label"
                label="Por página"
                value={perPage}
                onChange={(e) => onPerPageChange(Number(e.target.value))}
                disabled={loading}
              >
                {[10, 25, 50].map((n) => (
                  <MenuItem key={n} value={n}>{n}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <Tooltip title="Actualizar">
              <span>
                <IconButton onClick={onRefresh} disabled={loading}>
                  <ArrowClockwise />
                </IconButton>
              </span>
            </Tooltip>

            <Stack direction="row" spacing={1} alignItems="center">
              <Tooltip title="Anterior">
                <span>
                  <IconButton
                    onClick={() => onPageChange(page - 1)}
                    disabled={!canPrev || loading}
                  >
                    <ArrowLeft />
                  </IconButton>
                </span>
              </Tooltip>

              <Typography variant="body2">
                Página {page} / {totalPages}
              </Typography>

              <Tooltip title="Siguiente">
                <span>
                  <IconButton
                    onClick={() => onPageChange(page + 1)}
                    disabled={!canNext || loading}
                  >
                    <ArrowRight />
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>
          </Stack>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell width={48} />
                <TableCell>Fecha</TableCell>
                <TableCell>Reserva ID</TableCell>
                <TableCell>Paquete ID</TableCell>
                <TableCell>Contacto (email / tel)</TableCell>
                <TableCell>Pasajeros</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!loading && items.length === 0 && !error && (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Box sx={{ py: 3, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Sin resultados.
                      </Typography>
                      {totalPages > 1 && (
                        <Button
                          sx={{ mt: 1 }}
                          onClick={() => onPageChange(1)}
                          disabled={loading}
                        >
                          Ir a página 1
                        </Button>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              )}

              {items.map((it) => {
                const pasajeros = normalizePasajeros(it);
                const isOpen = open.has(it.id);
                return (
                  <React.Fragment key={it.id}>
                    <TableRow hover>
                      <TableCell width={48}>
                        <IconButton size="small" onClick={() => toggle(it.id)} aria-label="expand">
                          {isOpen ? <CaretDown /> : <CaretRight />}
                        </IconButton>
                      </TableCell>
                      <TableCell>{formatFecha(it.created_at)}</TableCell>
                      <TableCell>{it.id}</TableCell>
                      <TableCell>{it.paquete_id}</TableCell>
                      <TableCell>
                        {firstContacto(pasajeros)}
                      </TableCell>
                      <TableCell>{pasajeros.length}</TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell colSpan={6} sx={{ p: 0, border: 0 }}>
                        <Collapse in={isOpen} timeout="auto" unmountOnExit>
                          <Box sx={{ px: 2, py: 1 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                              Pasajeros
                            </Typography>
                            <NestedPasajerosTable pasajeros={pasajeros} />
                          </Box>
                          <Divider />
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                );
              })}

              {loading && skeletonRows(4).map((k) => (
                <React.Fragment key={`s-${k}`}>
                  <TableRow>
                    <TableCell width={48}><SkeletonLine /></TableCell>
                    <TableCell><SkeletonLine /></TableCell>
                    <TableCell><SkeletonLine /></TableCell>
                    <TableCell><SkeletonLine /></TableCell>
                    <TableCell><SkeletonLine /></TableCell>
                    <TableCell><SkeletonLine /></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={6} sx={{ p: 0, border: 0 }}>
                      <Box sx={{ px: 2, py: 1 }}>
                        <SkeletonLine />
                        <Box sx={{ mt: 1 }}>
                          <SkeletonLine />
                          <SkeletonLine />
                          <SkeletonLine />
                        </Box>
                      </Box>
                      <Divider />
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}

function NestedPasajerosTable({ pasajeros }: { pasajeros: Pasajero[] }) {
  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>Nombre</TableCell>
          <TableCell>Apellido</TableCell>
          <TableCell>Email</TableCell>
          <TableCell>Teléfono</TableCell>
          <TableCell>Pasaporte</TableCell>
          <TableCell>Fecha Nac.</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {pasajeros.map((p, idx) => (
          <TableRow key={idx}>
            <TableCell>{p.nombre}</TableCell>
            <TableCell>{p.apellido}</TableCell>
            <TableCell>{p.email}</TableCell>
            <TableCell>{p.telefono}</TableCell>
            <TableCell>{p.pasaporte || '-'}</TableCell>
            <TableCell>{formatFechaCorta(p.fecha_nacimiento)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function normalizePasajeros(it: Reserva & { pasajeros?: Pasajero[] }): Pasajero[] {
  if (Array.isArray(it.pasajeros) && it.pasajeros.length) return it.pasajeros;
  // Fallback: construir un solo pasajero desde los campos planos
  return [{
    nombre: it.nombre,
    apellido: it.apellido,
    email: it.email,
    telefono: it.telefono,
    pasaporte: it.pasaporte ?? null,
    fecha_nacimiento: it.fecha_nacimiento ?? null,
  }];
}

function firstContacto(pasajeros: Pasajero[]) {
  const p = pasajeros[0];
  return `${p.email} / ${p.telefono}`;
}

function formatFecha(dt?: string | null) {
  if (!dt) return '-';
  const d = new Date(dt.replace(' ', 'T'));
  if (isNaN(d.getTime())) return dt;
  return d.toLocaleString();
}

function formatFechaCorta(dmy?: string | null) {
  if (!dmy) return '-';
  const d = new Date(dmy);
  if (isNaN(d.getTime())) return dmy;
  return d.toLocaleDateString();
}

function skeletonRows(n: number) {
  return Array.from({ length: n }, (_, i) => i);
}
function SkeletonLine() {
  return <Box sx={{ height: 16, bgcolor: 'action.hover', borderRadius: 1 }} />;
}
