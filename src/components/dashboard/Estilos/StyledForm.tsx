// components/dashboard/Estilos/StyledForm.tsx
'use client';

import * as React from 'react';
import { Box, Stack, LinearProgress, Typography, Fade } from '@mui/material';
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
      <Box
        component="form"
        id="estilos-form"
        onSubmit={onSubmit}
        noValidate
      >
        {/* Animación al cambiar de sección */}
        <Fade
          in
          appear
          timeout={220}
          key={activeSection}
        >
          <Stack spacing={4} py={1}>
            {/* 
              División más realista por sección.
              Todo sigue siendo un solo form; solo cambias lo que se muestra.
            */}

            {/* BRANDING: nombre, identidad, logos, archivos */}
            {activeSection === 'branding' && (
              <>
                <DatosGeneralesSection />
                <IdentidadVisualSection />
                <ArchivosMultimediaSection />
              </>
            )}

            {/* COLORES: paleta + ajustes visuales que dependan de color */}
            {activeSection === 'colores' && (
              <>
                <PaletaColoresSection />
                {/* Si tu EncabezadoSection tiene temas de color, lo podés dejar acá también */}
              </>
            )}

            {/* HOME: portada, hero, banner de registro, buscador */}
            {activeSection === 'home' && (
              <>
                <EncabezadoSection />
                <BannerRegistroSection />
                <BuscadorSection />
              </>
            )}

            {/* COMPONENTES: tarjetas, publicidad, footer, etc. */}
            {activeSection === 'componentes' && (
              <>
                <TarjetasSection />
                <PublicidadClienteSection />
                <FooterSection />
              </>
            )}
          </Stack>
        </Fade>
      </Box>
    </FormProvider>
  );
}
