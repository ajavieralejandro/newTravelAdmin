// components/dashboard/Estilos/StyledForm.tsx
'use client';

import * as React from 'react';
import { Box, Stack, LinearProgress, Typography } from '@mui/material';
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

type StyledFormProps = {
  /**
   * Handler para persistir.
   * Recibe el payload ya mapeado por mapFormToPayload.
   */
  onSubmitPayload?: (payload: unknown) => Promise<void> | void;
};

export function StyledForm({ onSubmitPayload }: StyledFormProps): React.JSX.Element {
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
        <Stack spacing={4} py={1}>
          {/* Cada sección puede tener su propio id para el sidebar */}
          {/* DatosGeneralesSection ya puede tener id="estilos-generales" adentro */}
          <DatosGeneralesSection />
          <IdentidadVisualSection />
          <PaletaColoresSection />
          <EncabezadoSection />
          <BuscadorSection />
          <PublicidadClienteSection />
          <TarjetasSection />
          <BannerRegistroSection />
          <ArchivosMultimediaSection />
          <FooterSection />
        </Stack>
      </Box>
    </FormProvider>
  );
}
