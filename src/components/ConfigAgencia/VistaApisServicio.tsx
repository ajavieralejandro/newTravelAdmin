// src/components/ConfigAgencia/VistaApisServicio.tsx
'use client';

import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Switch,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useUserContext } from '@/contexts/user-context';
import {
  fetchTodasLasApis,
  fetchApisDeAgencia,
  asociarApisAAgencia,
  desasociarApiDeAgencia,
} from './apisAgenciaService';
import { useAlertaLocal } from './hooks/useAlertaLocal';

type VistaApisServicioProps = {
  agenciaId: string | number;
};

interface Api {
  id: number;
  nombre: string;
  descripcion: string;
}

export function VistaApisServicio({ agenciaId }: VistaApisServicioProps): JSX.Element {
  const [todasLasApis, setTodasLasApis] = useState<Api[]>([]);
  const [activasIds, setActivasIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  const { user } = useUserContext();
  const esSuperadmin = user?.rol === 'superadmin';

  const { mostrarAlerta, alertaJSX } = useAlertaLocal();

  const agenciaIdNum = useMemo(() => Number(agenciaId), [agenciaId]);

  useEffect(() => {
    let mounted = true;

    const cargarApis = async () => {
      setLoading(true);
      try {
        const todas = await fetchTodasLasApis();
        let activas: Api[] = [];
        try {
          activas = await fetchApisDeAgencia(agenciaIdNum);
        } catch {
          activas = [];
        }
        if (!mounted) return;
        setTodasLasApis(todas);
        setActivasIds(activas.map((api) => api.id));
      } catch {
        mostrarAlerta('No se pudieron cargar las APIs.', 'error');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    if (!Number.isNaN(agenciaIdNum)) {
      cargarApis();
    } else {
      setLoading(false);
    }

    return () => {
      mounted = false;
    };
  }, [agenciaIdNum, mostrarAlerta]);

  const toggleApi = async (api: Api, habilitado: boolean) => {
    const prev = activasIds;
    const next = habilitado ? prev.filter((id) => id !== api.id) : [...prev, api.id];
    setActivasIds(next);

    try {
      if (habilitado) {
        await desasociarApiDeAgencia(agenciaIdNum, api.id);
      } else {
        await asociarApisAAgencia(agenciaIdNum, [api.id]);
      }
      mostrarAlerta('Cambios guardados', 'success');
    } catch {
      setActivasIds(prev);
      mostrarAlerta('No se pudo actualizar la API.', 'error');
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (Number.isNaN(agenciaIdNum)) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="body2" color="error">
          ID de agencia inválido.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {alertaJSX}

      <Typography variant="h6" gutterBottom>
        APIs disponibles para la agencia
      </Typography>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Nombre</TableCell>
            <TableCell>Descripción</TableCell>
            <TableCell>Activo</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {todasLasApis.map((api) => {
            const habilitado = activasIds.includes(api.id);
            return (
              <TableRow key={api.id}>
                <TableCell>{api.nombre}</TableCell>
                <TableCell>{api.descripcion}</TableCell>
                <TableCell>
                  <Switch
                    checked={habilitado}
                    disabled={!esSuperadmin}
                    onChange={() => toggleApi(api, habilitado)}
                    color="primary"
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Box>
  );
}
