'use client';

import * as React from 'react';
import {
  Stack,
  Typography,
  Alert,
  Card,
  CardHeader,
  CardContent,
  Divider,
  Box,
  CircularProgress,
  Chip,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Button,
} from '@mui/material';

import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import ViewCarouselOutlinedIcon from '@mui/icons-material/ViewCarouselOutlined';
import WebAssetOutlinedIcon from '@mui/icons-material/WebAssetOutlined';

import { StyledForm, type EstilosSectionId } from '@/components/dashboard/Estilos/StyledForm';
import { useUserContext } from '@/contexts/user-context';
import { agenciasService } from '@/contexts/features/Agencias/services/agenciasService';
import { mapFormToPayload } from '@/contexts/features/Agencias/services/agenciaMapper';

function toNumber(x: unknown): number | undefined {
  if (x == null) return undefined;
  if (typeof x === 'number') return Number.isFinite(x) ? x : undefined;
  const n = parseInt(String(x).trim(), 10);
  return Number.isFinite(n) ? n : undefined;
}

const ESTILOS_SECTIONS: {
  id: EstilosSectionId;
  label: string;
  description?: string;
  icon: React.ReactNode;
}[] = [
  {
    id: 'branding',
    label: 'Branding',
    description: 'Nombre, identidad visual, logos y archivos.',
    icon: <ImageOutlinedIcon fontSize="small" />,
  },
  {
    id: 'colores',
    label: 'Colores',
    description: 'Paleta principal, fondos y acentos.',
    icon: <PaletteOutlinedIcon fontSize="small" />,
  },
  {
    id: 'home',
    label: 'Portada / Home',
    description: 'Hero, banner de registro y buscador.',
    icon: <ViewCarouselOutlinedIcon fontSize="small" />,
  },
  {
    id: 'componentes',
    label: 'Componentes',
    description: 'Tarjetas, publicidad y footer.',
    icon: <WebAssetOutlinedIcon fontSize="small" />,
  },
];

export default function Page(): React.JSX.Element {
  const { user, agenciaRaw, actualizarAgenciaLocal } = useUserContext();

  const idAgencia = React.useMemo<number | undefined>(() => {
    const candidates = [
      (user as any)?.agencia_id,
      (user as any)?.agenciaId,
      (user as any)?.idAgencia,
      (agenciaRaw as any)?.idAgencia,
      (agenciaRaw as any)?.agencia_id,
      (agenciaRaw as any)?.id,
    ];
    for (const c of candidates) {
      const n = toNumber(c);
      if (n !== undefined) return n;
    }
    return undefined;
  }, [user, agenciaRaw]);

  const [saving, setSaving] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [okMsg, setOkMsg] = React.useState<string | null>(null);
  const [activeSection, setActiveSection] =
    React.useState<EstilosSectionId>('branding');

  const hasAgencia = Boolean(idAgencia);

  const handleSubmitEstilos = React.useCallback(
    async (payloadUnknown: unknown) => {
      const payload = payloadUnknown as ReturnType<typeof mapFormToPayload>;

      if (!idAgencia) {
        setErrorMsg('No se pudo resolver el ID de la agencia.');
        return;
      }

      setSaving(true);
      setErrorMsg(null);
      setOkMsg(null);

      try {
        const back = await agenciasService.update(String(idAgencia), payload);
        await actualizarAgenciaLocal(back);
        setOkMsg('Estilos guardados correctamente.');
      } catch (e: any) {
        setErrorMsg(e?.message || 'Error al guardar estilos.');
      } finally {
        setSaving(false);
      }
    },
    [idAgencia, actualizarAgenciaLocal]
  );

  const handleClickSection = (id: EstilosSectionId) => {
    setActiveSection(id);

    // Opcional: scroll al formulario cuando cambiás de sección
    const formEl = document.getElementById('estilos-form');
    if (formEl) {
      formEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <Stack
      spacing={3}
      sx={{
        maxWidth: 1200,
        mx: 'auto',
      }}
    >
      {/* ===== Header principal ===== */}
      <Stack spacing={1}>
        <Typography
          component="p"
          variant="overline"
          sx={{
            letterSpacing: '.18em',
            textTransform: 'uppercase',
            color: 'text.secondary',
          }}
        >
          Panel · Branding
        </Typography>

        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
        >
          <Stack spacing={0.5}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
              }}
            >
              Configuración de estilos
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Organizamos la configuración en secciones: branding, colores,
              portada y componentes visuales del sitio público.
            </Typography>
          </Stack>

          <Chip
            size="small"
            label={
              hasAgencia
                ? `Agencia vinculada #${idAgencia}`
                : 'Agencia no seleccionada'
            }
            color={hasAgencia ? 'success' : 'warning'}
            variant={hasAgencia ? 'filled' : 'outlined'}
          />
        </Stack>
      </Stack>

      {/* ===== Mensajes de estado ===== */}
      <Stack spacing={1}>
        {errorMsg && <Alert severity="error">{errorMsg}</Alert>}
        {okMsg && <Alert severity="success">{okMsg}</Alert>}

        {!hasAgencia && (
          <Alert severity="info" variant="outlined">
            No se detectó una agencia asociada al usuario actual. Vinculá una
            agencia desde   el panel de administración para aplicar estos estilos.
          </Alert>
        )}
      </Stack>

      {/* ===== Card principal con layout por secciones ===== */}
      <Card
        variant="outlined"
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
        }}
      >
        <CardHeader
          title={
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="h6" component="span">
                Estilos del sitio
              </Typography>
              <Chip
                size="small"
                label={
                  saving
                    ? 'Guardando…'
                    : hasAgencia
                    ? 'Edición sobre agencia vinculada'
                    : 'Solo lectura'
                }
                color={saving ? 'info' : hasAgencia ? 'default' : 'warning'}
                variant="outlined"
              />
            </Stack>
          }
          subheader={
            hasAgencia
              ? 'Los cambios se aplican al front público de esta agencia.'
              : 'Vinculá una agencia para habilitar la edición de estilos.'
          }
        />

        <Divider />

        <CardContent>
          <Box sx={{ position: 'relative' }}>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={3}
              alignItems="flex-start"
            >
              {/* ==== Navegación lateral por secciones ==== */}
              <Box
                sx={{
                  width: { xs: '100%', md: 260 },
                  flexShrink: 0,
                  borderRadius: 2,
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  bgcolor: (theme) =>
                    theme.palette.mode === 'light'
                      ? 'grey.50'
                      : 'background.paper',
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{
                    px: 2,
                    pt: 1.5,
                    pb: 1,
                    textTransform: 'uppercase',
                    letterSpacing: '.12em',
                    fontSize: 11,
                    color: 'text.secondary',
                  }}
                >
                  Secciones
                </Typography>
                <Divider />
                <List dense disablePadding>
                  {ESTILOS_SECTIONS.map((sec) => (
                    <ListItemButton
                      key={sec.id}
                      selected={activeSection === sec.id}
                      onClick={() => handleClickSection(sec.id)}
                      sx={{
                        alignItems: 'flex-start',
                        py: 1,
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 32, mt: '2px' }}>
                        {sec.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight:
                                activeSection === sec.id ? 600 : 500,
                            }}
                          >
                            {sec.label}
                          </Typography>
                        }
                        secondary={
                          sec.description ? (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {sec.description}
                            </Typography>
                          ) : null
                        }
                      />
                    </ListItemButton>
                  ))}
                </List>
              </Box>

              {/* ==== Área de formulario ==== */}
              <Box
                sx={{
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <StyledForm
                  activeSection={activeSection}
                  onSubmitPayload={handleSubmitEstilos}
                />

                <Box sx={{ mt: 3, textAlign: 'right' }}>
                  <Button
                    type="submit"
                    form="estilos-form"
                    variant="contained"
                    color="primary"
                    disabled={saving || !hasAgencia}
                    sx={{ textTransform: 'none', borderRadius: 999 }}
                  >
                    {saving ? 'Guardando…' : 'Guardar cambios'}
                  </Button>
                </Box>
              </Box>
            </Stack>

            {(saving || !hasAgencia) && (
              <Box
                sx={(theme) => ({
                  position: 'absolute',
                  inset: 0,
                  bgcolor:
                    theme.palette.mode === 'dark'
                      ? 'rgba(15,23,42,0.55)'
                      : 'rgba(255,255,255,0.65)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 2,
                  backdropFilter: 'blur(2px)',
                  zIndex: 10,
                })}
              >
                <Stack alignItems="center" spacing={1}>
                  {saving ? (
                    <>
                      <CircularProgress size={26} />
                      <Typography variant="caption" color="text.secondary">
                        Guardando estilos…
                      </Typography>
                    </>
                  ) : (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ textAlign: 'center', maxWidth: 260 }}
                    >
                      Vinculá una agencia para habilitar la edición de estilos.
                    </Typography>
                  )}
                </Stack>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>
    </Stack>
  );
}
