'use client';

import * as React from 'react';
import {
  Card, CardHeader, CardContent, Divider, Table, TableBody, TableCell,
  TableHead, TableRow, TableContainer, LinearProgress, Button, Stack, Typography
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

type Opportunity = {
  id: string;
  asunto: string;
  contacto: string;
  estado: string;      // viene de EstadoCodigo / EstadoNombre
  creado_en: string;   // ISO o ''
};

type AtlasItem = {
  OportunidadNumero?: string;
  OportunidadAsunto?: string;
  ContactoNombre?: string;
  EstadoCodigo?: string;
  EstadoNombre?: string;
  OportunidadFechaCreacion?: string;
  OportunidadFechaRecibido?: string;
};

type ApiResp = {
  ok: boolean;
  count: number;
  items: AtlasItem[];
};

function mapAtlasToRow(it: AtlasItem): Opportunity {
  const creado = it.OportunidadFechaCreacion || it.OportunidadFechaRecibido || '';
  return {
    id: it.OportunidadNumero ? `OP-${it.OportunidadNumero}` : '-',
    asunto: it.OportunidadAsunto || '(Sin asunto)',
    contacto: it.ContactoNombre || '(Sin contacto)',
    estado: it.EstadoCodigo || it.EstadoNombre || '',
    creado_en: creado,
  };
}

export function OpportunitiesTable({
  agenciaId,
  apiBase = 'https://travelconnect.com.ar' 
}: { agenciaId: number | null; apiBase?: string }) {
  const [rows, setRows] = React.useState<Opportunity[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    if (!agenciaId) {
      setRows([]);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const url = `${apiBase}/api/agencias/${agenciaId}/atlas/oportunidades?registros=100&pagina=1`;
      const r = await fetch(url, { headers: { Accept: 'application/json' } });
      if (!r.ok) throw new Error(`HTTP ${r.status} ${r.statusText}`);
      const json: ApiResp = await r.json();
      const items = Array.isArray(json?.items) ? json.items : [];
      setRows(items.map(mapAtlasToRow));
    } catch (e: any) {
      setError(e?.message ?? 'Error al cargar oportunidades');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [agenciaId, apiBase]);

  React.useEffect(() => { void load(); }, [load]);

  return (
    <Card>
      <CardHeader
        title="Oportunidades"
        subheader={agenciaId ? `Agencia #${agenciaId}` : 'Seleccioná una agencia'}
        action={
          <Button startIcon={<AddIcon />} variant="outlined" disabled>
            Nueva oportunidad
          </Button>
        }
      />
      <Divider />
      <CardContent>
        {loading && <LinearProgress sx={{ mb: 2 }} />}

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Asunto</TableCell>
                <TableCell>Contacto</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Creado</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!loading && rows.map((op) => (
                <TableRow key={`${op.id}-${op.creado_en}`} hover>
                  <TableCell>{op.id}</TableCell>
                  <TableCell>{op.asunto}</TableCell>
                  <TableCell>{op.contacto}</TableCell>
                  <TableCell>{op.estado}</TableCell>
                  <TableCell>
                    {op.creado_en && op.creado_en !== '0000-00-00T00:00:00'
                      ? new Date(op.creado_en).toLocaleString('es-AR')
                      : '—'}
                  </TableCell>
                </TableRow>
              ))}

              {!loading && rows.length === 0 && !error && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <Stack spacing={1} alignItems="center">
                      <Typography variant="body2" sx={{ opacity: 0.7 }}>
                        Aún no hay oportunidades para mostrar.
                      </Typography>
                      <Button startIcon={<AddIcon />} variant="outlined" disabled>
                        Crear oportunidad
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
          <Button onClick={() => void load()} disabled={loading}>Refrescar</Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
