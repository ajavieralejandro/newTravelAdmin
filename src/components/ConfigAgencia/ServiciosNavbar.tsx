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
  Stack,
} from '@mui/material';

interface ServiciosNavbarProps {
  secciones: string[];
  seccionSeleccionada: string;
  onSeleccionarSeccion: (seccion: string) => void;
  onImplementarCambios: () => void;
  /**
   * Opcional: función para saber si una sección está habilitada desde afuera.
   * Si no se pasa, el componente maneja el estado internamente.
   */
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
    // Si el estado se maneja interno, actualizamos
    if (!seccionHabilitada) {
      setActivados((prev) => ({ ...prev, [seccion]: !prev[seccion] }));
    }
    // Si se maneja desde afuera, este switch sería “solo visual”.
    // Podríamos agregar un callback onToggleSeccion si más adelante lo necesitás.
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minWidth: 260,
        borderRight: (theme) => `1px solid ${theme.palette.divider}`,
        bgcolor: (theme) =>
          theme.palette.mode === 'light' ? 'grey.50' : 'background.default',
      }}
    >
      <Box sx={{ px: 2, py: 2 }}>
        <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
          Configuración
        </Typography>
        <Typography variant="h6" sx={{ mt: 0.5 }}>
          Servicios
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Activá o desactivá los bloques que querés mostrar en el site.
        </Typography>
      </Box>

      <Divider />

      <List sx={{ flexGrow: 1, py: 0 }}>
        {secciones.map((seccion) => {
          const habilitada = isHabilitada(seccion);
          const selected = seccionSeleccionada === seccion;

          return (
            <ListItemButton
              key={seccion}
              selected={selected}
              onClick={() => {
                if (habilitada) {
                  onSeleccionarSeccion(seccion);
                }
              }}
              sx={(theme) => ({
                py: 1,
                gap: 1,
                opacity: habilitada ? 1 : 0.5,
                '&.Mui-selected': {
                  bgcolor:
                    theme.palette.mode === 'light'
                      ? theme.palette.primary.light
                      : theme.palette.primary.dark,
                  color: theme.palette.primary.contrastText,
                  '&:hover': {
                    bgcolor:
                      theme.palette.mode === 'light'
                        ? theme.palette.primary.main
                        : theme.palette.primary.dark,
                  },
                },
              })}
            >
              <Switch
                edge="start"
                checked={habilitada}
                onChange={(e) => handleToggle(seccion, e)}
                onClick={(e) => e.stopPropagation()}
                size="small"
                color="primary"
              />
              <ListItemText
                primary={
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: selected ? 600 : 500 }}
                  >
                    {seccion}
                  </Typography>
                }
                secondary={
                  selected ? (
                    <Typography
                      variant="caption"
                      color={habilitada ? 'primary.contrastText' : 'text.secondary'}
                    >
                      Sección seleccionada
                    </Typography>
                  ) : null
                }
              />
            </ListItemButton>
          );
        })}
      </List>

      <Divider />

      <Box sx={{ p: 2 }}>
        <Stack spacing={1}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={onImplementarCambios}
            sx={{ textTransform: 'none', borderRadius: 999 }}
          >
            Implementar cambios
          </Button>
          <Typography variant="caption" color="text.secondary" textAlign="center">
            Los cambios se verán reflejados en el sitio público una vez aplicados.
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
};
