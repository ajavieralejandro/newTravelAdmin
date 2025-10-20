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
  seccionHabilitada?: (seccion: string) => boolean;
}

export const ServiciosNavbar = ({
  secciones,
  seccionSeleccionada,
  onSeleccionarSeccion,
  onImplementarCambios,
  seccionHabilitada,
}: ServiciosNavbarProps) => {
  // Estado interno solo si no hay prop externa
  const [activados, setActivados] = React.useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    secciones.forEach((s) => {
      initial[s] = true;
    });
    return initial;
  });

  const isHabilitada = (seccion: string) =>
    seccionHabilitada ? seccionHabilitada(seccion) : activados[seccion];

  const handleToggle = (
    seccion: string,
    event: React.MouseEvent | React.ChangeEvent<HTMLInputElement>
  ) => {
    event.stopPropagation();
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
          return (
            <ListItemButton
              key={seccion}
              selected={seccionSeleccionada === seccion}
              onClick={() => {
                if (habilitada) {
                  onSeleccionarSeccion(seccion);
                }
              }}
            >
              <Switch
                edge="start"
                checked={habilitada}
                onChange={(e) => handleToggle(seccion, e)}
                onClick={(e) => e.stopPropagation()}
                size="small"
                color="primary"
              />
              <ListItemText primary={seccion} />
            </ListItemButton>
          );
        })}
      </List>
      <Box sx={{ p: 2 }}>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          onClick={onImplementarCambios}
        >
          Implementar cambios
        </Button>
      </Box>
    </Box>
  );
};

