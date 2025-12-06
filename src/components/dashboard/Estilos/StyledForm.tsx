// components/dashboard/Estilos/StyledForm.tsx
'use client';

import * as React from 'react';
import {
  Box,
  Stack,
  LinearProgress,
  Typography,
  Fade,
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import { FormProvider, useForm } from 'react-hook-form';

import { useUserContext } from '@/contexts/user-context';
import {
  mapFormToPayload,
  type AgenciaFormValues,
} from '@/contexts/features/Agencias/services/agenciaMapper';

// Secciones
import { DatosGeneralesSection } from './DatosGeneralesSection';
import { IdentidadVisualSection } from './IdentidadVisualSection';
import { PaletaColoresSection } from './PaletaColoresSection';
import { EncabezadoSection } from './EncabezadoSection';
import { BuscadorSection } from './BuscadorSection';
import { PublicidadClienteSection } from './PublicidadClienteSection';
import { TarjetasSection } from './TarjetasSection';
import { BannerRegistroSection } from './BannerRegistroSection';
import { ArchivosMultimediaSection } from './ArchivosMultimediaSection';
import { FooterSection } from './FooterSection';

export type EstilosSectionId =
  | 'branding'
  | 'colores'
  | 'home'
  | 'componentes';

type StyledFormProps = {
  /**
   * Handler para persistir.
   * Recibe el payload ya mapeado por mapFormToPayload.
   */
  onSubmitPayload?: (payload: unknown) => Promise<void> | void;

  /**
   * Sección activa elegida desde el sidebar.
   */
  activeSection: EstilosSectionId;
};

export function StyledForm({
  onSubmitPayload,
  activeSection,
}: StyledFormProps): React.JSX.Element {
  const { agenciaView, isLoading } = useUserContext();

  const methods = useForm<AgenciaFormValues>({
    mode: 'onChange',
    values: agenciaView ?? ({} as AgenciaFormValues),
  });

  const { handleSubmit } = methods;

  React.useEffect(() => {
    console.groupCollapsed('[StyledForm] init/defaultValues');
    console.info('agenciaView', agenciaView);
    console.info('defaultValues (RHF.getValues())', methods.getValues());
    console.groupEnd();
  }, [agenciaView, methods]);

  React.useEffect(() => {
    const { isDirty, isValid, errors } = methods.formState;
    console.groupCollapsed('[StyledForm] formState change');
    console.info('isDirty', isDirty);
    console.info('isValid', isValid);
    console.info('errors', errors);
    console.groupEnd();
  }, [
    methods.formState.isDirty,
    methods.formState.isValid,
    methods.formState.errors,
    methods,
  ]);

  const onSubmit = handleSubmit(async () => {
    const values = methods.getValues();

    console.groupCollapsed('[StyledForm] submit');
    console.info('values', values);
    const payload = mapFormToPayload(values);
    console.info('payload', payload);
    console.groupEnd();

    if (onSubmitPayload) {
      await onSubmitPayload(payload);
    } else {
      console.info('[StyledForm] onSubmitPayload no provisto → log solamente');
    }
  });

  // ------- Sub-tabs internos para atomizar secciones grandes -------

  const [brandingTab, setBrandingTab] = React.useState<
    'datos' | 'identidad' | 'archivos'
  >('datos');

  const [componentesTab, setComponentesTab] = React.useState<
    'tarjetas' | 'publicidad' | 'footer'
  >('tarjetas');

  // Cuando cambio de sección principal, reseteo (opcional)
  React.useEffect(() => {
    if (activeSection === 'branding') {
      setBrandingTab('datos');
    }
    if (activeSection === 'componentes') {
      setComponentesTab('tarjetas');
    }
  }, [activeSection]);

  if (isLoading || !agenciaView) {
    return (
      <Stack spacing={1}>
        <Typography variant="body2" color="text.secondary">
          Cargando estilos de la agencia...
        </Typography>
        <LinearProgress />
      </Stack>
    );
  }

  return (
    <FormProvider {...methods}>
      <Box component="form" id="estilos-form" onSubmit={onSubmit} noValidate>
        {/* Animación al cambiar de sección */}
        <Fade in appear timeout={220} key={activeSection}>
          <Stack spacing={3} py={1}>
            {/* BRANDING: nombre, identidad, logos, archivos (atomizado con tabs) */}
            {activeSection === 'branding' && (
              <Stack spacing={2}>
                <Box
                  sx={{
                    borderBottom: 1,
                    borderColor: 'divider',
                    mb: 1,
                  }}
                >
                  <Tabs
                    value={brandingTab}
                    onChange={(_, v) => setBrandingTab(v)}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                      minHeight: 36,
                      '& .MuiTab-root': {
                        minHeight: 36,
                        textTransform: 'none',
                        fontSize: 13,
                      },
                    }}
                  >
                    <Tab value="datos" label="Datos generales" />
                    <Tab value="identidad" label="Identidad visual" />
                    <Tab value="archivos" label="Archivos / Multimedia" />
                  </Tabs>
                </Box>

                <Divider />

                {brandingTab === 'datos' && <DatosGeneralesSection />}
                {brandingTab === 'identidad' && <IdentidadVisualSection />}
                {brandingTab === 'archivos' && <ArchivosMultimediaSection />}
              </Stack>
            )}

            {/* COLORES: paleta + ajustes visuales que dependan de color */}
            {activeSection === 'colores' && (
              <Stack spacing={2}>
                <PaletaColoresSection />
                {/* Podrías agregar más sub-secciones de colores acá si hace falta */}
              </Stack>
            )}

            {/* HOME: portada, hero, banner de registro, buscador */}
            {activeSection === 'home' && (
              <Stack spacing={3}>
                <EncabezadoSection />
                <BannerRegistroSection />
                <BuscadorSection />
              </Stack>
            )}

            {/* COMPONENTES: tarjetas, publicidad, footer (atomizado con tabs) */}
            {activeSection === 'componentes' && (
              <Stack spacing={2}>
                <Box
                  sx={{
                    borderBottom: 1,
                    borderColor: 'divider',
                    mb: 1,
                  }}
                >
                  <Tabs
                    value={componentesTab}
                    onChange={(_, v) => setComponentesTab(v)}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                      minHeight: 36,
                      '& .MuiTab-root': {
                        minHeight: 36,
                        textTransform: 'none',
                        fontSize: 13,
                      },
                    }}
                  >
                    <Tab value="tarjetas" label="Tarjetas y listados" />
                    <Tab value="publicidad" label="Publicidad al cliente" />
                    <Tab value="footer" label="Footer y pie de página" />
                  </Tabs>
                </Box>

                <Divider />

                {componentesTab === 'tarjetas' && <TarjetasSection />}
                {componentesTab === 'publicidad' && (
                  <PublicidadClienteSection />
                )}
                {componentesTab === 'footer' && <FooterSection />}
              </Stack>
            )}
          </Stack>
        </Fade>
      </Box>
    </FormProvider>
  );
}
