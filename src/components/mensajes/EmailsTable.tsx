// components/mensajes/EmailsTable.tsx
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
} from '@mui/material';
import { ArrowLeft, ArrowRight, ArrowClockwise } from '@phosphor-icons/react';
import type { EmailRegistrado } from '@/types/Mensajes';

export interface EmailsTableProps {
  items: EmailRegistrado[];
  page: number;
  perPage: number;
  total: number;
  loading: boolean;
  error: string | null;
  onPageChange: (nextPage: number) => void;
  onPerPageChange: (nextPerPage: number) => void;
  onRefresh: () => void;
}

export default function EmailsTable({
  items,
  page,
  perPage,
  total,
  loading,
  error,
  onPageChange,
  onPerPageChange,
  onRefresh,
}: EmailsTableProps): React.JSX.Element {
  const totalPages = Math.max(1, Math.ceil(total / Math.max(1, perPage)));
  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <Card variant="outlined">
      {loading && <LinearProgress />}

      <CardContent>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2, gap: 2 }}>
          <Typography variant="subtitle1">
            Mails registrados {total ? `• ${total}` : ''}
          </Typography>

          <Stack direction="row" spacing={1} alignItems="center">
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel id="per-page-label">Por página</InputLabel>
              <Select
                labelId="per-page-label"
                label="Por página"
                value={perPage}
                onChange={(e) => onPerPageChange(Number(e.target.value))}
                disabled={loading}
              >
                {[15, 25, 50].map((n) => (
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
                <TableCell>Email</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!loading && items.length === 0 && !error && (
                <TableRow>
                  <TableCell>
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

              {items.map((emailObj, idx) => (
                <TableRow key={`${emailObj.id}-${idx}`} hover>
                  <TableCell>{emailObj.email}</TableCell>
                </TableRow>
              ))}

              {loading && skeletonRows(8).map((k) => (
                <TableRow key={`s-${k}`}>
                  <TableCell><SkeletonLine /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}

function skeletonRows(n: number) {
  return Array.from({ length: n }, (_, i) => i);
}
function SkeletonLine() {
  return <Box sx={{ height: 16, bgcolor: 'action.hover', borderRadius: 1 }} />;
}
