'use client'
import * as React from 'react'
import {
  Avatar,
  Box,
  Card,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  IconButton,
  Tooltip,
  Button,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'

import { useSelection } from '@/hooks/use-selection'
import { AgenciaBackData } from '@/types/AgenciaBackData'

interface CustomersTableProps {
  rows: AgenciaBackData[]
  count: number
  page: number
  rowsPerPage: number
  onEdit?: (agencia: AgenciaBackData) => void
  /** (deprecated) ya no se muestra la columna Servicios */
  onServicios?: (agencia: AgenciaBackData) => void
  onEliminar?: (agencia: AgenciaBackData) => void
  onPageChange: (page: number) => void
  onRowsPerPageChange: (rowsPerPage: number) => void
}

/** Asegura que la URL tenga esquema http/https */
function ensureHttp(u?: string | null): string | undefined {
  if (!u) return undefined
  const hasProtocol = /^https?:\/\//i.test(u)
  return hasProtocol ? u : `https://${u}`
}

/** Devuelve el href preferido: primero `url`, luego `dominio` */
function getHrefFromRow(row: AgenciaBackData): string | undefined {
  if (row.url) return ensureHttp(row.url)
  if (row.dominio) return ensureHttp(row.dominio)
  return undefined
}

export function CustomersTable({
  rows,
  count,
  page,
  rowsPerPage,
  onEdit,
  onServicios: _onServicios, // deprecated / no usado
  onEliminar,
  onPageChange,
  onRowsPerPageChange,
}: CustomersTableProps): React.JSX.Element {
  const rowIds = React.useMemo(() => rows.map((agencia) => agencia.idAgencia), [rows])
  const { selected } = useSelection(rowIds)

  React.useEffect(() => {
    const ids = rows.map((r) => r.idAgencia)
    const uniqueIds = new Set(ids)
    if (ids.length !== uniqueIds.size) {
      console.warn('⚠️ IDs duplicados detectados en CustomersTable:', ids)
    }
    if (ids.some((id) => !id)) {
      console.warn('⚠️ IDs nulos o indefinidos en CustomersTable:', ids)
    }
  }, [rows])

  const handleChangePage = (_event: unknown, newPage: number) => {
    onPageChange(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    onRowsPerPageChange(parseInt(event.target.value, 10))
    onPageChange(0)
  }

  const paginatedRows = React.useMemo(() => {
    const start = page * rowsPerPage
    return rows.slice(start, start + rowsPerPage)
  }, [page, rowsPerPage, rows])

  return (
    <Card>
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: 900 }} aria-label="Tabla de agencias">
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Dominio</TableCell>
              <TableCell>Modificar</TableCell>
              <TableCell>Eliminar</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                    No hay agencias para mostrar.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedRows.map((row, index) => {
                const isSelected = selected?.has(row.idAgencia)
                const key = row.idAgencia || `row-fallback-${index}`
                const href = getHrefFromRow(row)
                const linkLabel = row.dominio || row.url || 'Sin dominio'

                return (
                  <TableRow hover key={key} selected={isSelected}>
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar src={row.logo ?? undefined} alt={row.nombre ?? 'Agencia'} />
                        <Typography variant="subtitle2">
                          {row.nombre || 'Sin nombre'}
                        </Typography>
                      </Stack>
                    </TableCell>

                    <TableCell>{row.footer_email || '—'}</TableCell>

                    <TableCell>
                      {href ? (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Abrir sitio de ${row.nombre ?? 'agencia'}`}
                          style={{ color: '#1976d2', textDecoration: 'underline' }}
                          title={href}
                        >
                          {linkLabel}
                        </a>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Sin dominio
                        </Typography>
                      )}
                    </TableCell>

                    <TableCell>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => onEdit?.(row)}
                        disabled={!onEdit}
                      >
                        Modificar
                      </Button>
                    </TableCell>

                    <TableCell>
                      <Tooltip title="Eliminar agencia">
                        <span>
                          <IconButton color="error" onClick={() => onEliminar?.(row)} disabled={!onEliminar}>
                            <DeleteIcon />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </Box>
      <Divider />
      <TablePagination
        component="div"
        count={count}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </Card>
  )
}
