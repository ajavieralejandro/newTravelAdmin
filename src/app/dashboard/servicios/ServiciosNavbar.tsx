// src/components/ConfigAgencia/ServiciosNavbar.tsx
'use client';
import * as React from 'react';
import {
  Box,
  List,
  ListItemButton,
  ListItemText,
  Switch,
  Divider,
  Button,
  Typography,
} from '@mui/material';

interface ServiciosNavbarProps {
  secciones: string[];
  seccionSeleccionada: string;
  onSeleccionarSeccion: (seccion: string) => void;
  onImplementarCambios: () => void;
  /** Si no se provee, todas habilitadas por defecto */
  seccionHabilitada?: (seccion: string) => boolean;
}

export const ServiciosNavbar = ({
  secciones,
  seccionSeleccionada,
  onSeleccionarSeccion,
  onImplementarCambios,
  seccionHabilitada,
}: ServiciosNavbarProps) => {
  // Estado interno sólo si no hay prop externa (fallback visual)
  const [activados, setActivados] = React.useState<Record<string, boolean>>({});

  // Inicializa / resetea activados cuando cambian las secciones
  React.useEffect(() => {
    setActivados((prev) => {
      const next: Record<string, boolean> = {};
      secciones.forEach((s) => {
        next[s] = prev[s] ?? true;
      });
      return next;
    });
  }, [secciones]);

  const isHabilitada = (seccion: string) =>
    seccionHabilitada ? seccionHabilitada(seccion) : !!activados[seccion];

  const handleToggle = (
    seccion: string,
    event: React.MouseEvent | React.ChangeEvent<HTMLInputElement>
  ) => {
    event.stopPropagation();
    // Sólo afecta al fallback local
    setActivados((prev) => ({ ...prev, [seccion]: !prev[seccion] }));
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minWidth: 240 }}>
      <Typography variant="h6" sx={{ p: 2 }}>
        Servicios
      </Typography>
      <Divider />
      <List sx={{ flexGrow: 1 }}>
        {secciones.map((seccion) => {
          const habilitada = isHabilitada(seccion);
          const selected = seccionSeleccionada === seccion;

          return (
            <ListItemButton
              key={seccion}
              selected={selected}
              onClick={() => {
                if (habilitada) onSeleccionarSeccion(seccion);
              }}
              aria-selected={selected}
              aria-disabled={!habilitada}
            >
              <Switch
                edge="start"
                checked={habilitada}
                onChange={(e) => handleToggle(seccion, e)}
                onClick={(e) => e.stopPropagation()}
                size="small"
                color="primary"
                inputProps={{ 'aria-label': `Habilitar sección ${seccion}` }}
              />
              <ListItemText primary={seccion} />
            </ListItemButton>
          );
        })}
      </List>

      <Divider />
      
    </Box>
  );
};
