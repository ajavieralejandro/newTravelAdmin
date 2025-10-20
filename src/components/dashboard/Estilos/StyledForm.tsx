// components/dashboard/Estilos/StyledForm.tsx
'use client';

import * as React from 'react';
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
  Stack,
  Snackbar,
  Alert,
  LinearProgress,
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

type StyledFormProps = {
  /**
   * Handler opcional para persistir.
   * Si no se provee, solo se loguea el payload construido.
   */
  onSubmitPayload?: (payload: unknown) => Promise<void> | void;
};

export function StyledForm({ onSubmitPayload }: StyledFormProps): React.JSX.Element {
  const { agenciaView, isLoading } = useUserContext();

  // Estado de feedback local
  const [mensaje, setMensaje] = React.useState<{ tipo: 'success' | 'error' | 'info'; texto: string } | null>(null);
  const [enviando, setEnviando] = React.useState(false);

  // Form init: cuando cambia agenciaView (p.ej. tras recarga), reseteamos defaultValues
  const methods = useForm<AgenciaFormValues>({
    mode: 'onChange',
    values: agenciaView ?? ({} as AgenciaFormValues),
  });

  const { handleSubmit, reset, formState, getValues } = methods;

  // 🔍 LOG: init/defaultValues cuando cambia agenciaView
  React.useEffect(() => {
    console.groupCollapsed('[StyledForm] init/defaultValues');
    console.info('agenciaView', agenciaView);
    console.info('defaultValues (RHF.getValues())', methods.getValues());
    console.groupEnd();
  }, [agenciaView, methods]);

  // 🔍 LOG: cambios relevantes de formState
  React.useEffect(() => {
    const { isDirty, isValid, errors } = methods.formState;
    console.groupCollapsed('[StyledForm] formState change');
    console.info('isDirty', isDirty);
    console.info('isValid', isValid);
    console.info('errors', errors);
    console.groupEnd();
  }, [methods.formState.isDirty, methods.formState.isValid, methods.formState.errors, methods]);

  // Reset a los valores actuales del contexto
  const onReset = React.useCallback(() => {
    if (!agenciaView) return;
    console.info('[StyledForm] onReset → restaurando valores del contexto');
    reset(agenciaView, { keepDirty: false, keepTouched: false });
    setMensaje({ tipo: 'info', texto: 'Cambios descartados' });
  }, [agenciaView, reset]);

  const onSubmit = handleSubmit(async () => {
    try {
      setEnviando(true);

      // 🔍 LOG: submit (values + payload) en un groupCollapsed
      console.groupCollapsed('[StyledForm] submit');
      console.info('values', methods.getValues());
      const payload = mapFormToPayload(methods.getValues());
      console.info('payload', payload);
      console.groupEnd();

      if (onSubmitPayload) {
        await onSubmitPayload(payload);
      } else {
        // Por ahora, si no hay handler, solo log
        console.info('[StyledForm] onSubmitPayload no provisto → log solamente');
      }

      setMensaje({ tipo: 'success', texto: 'Estilos guardados correctamente' });
    } catch (err) {
      console.error('[StyledForm] submit → error', err);
      setMensaje({ tipo: 'error', texto: 'Ocurrió un error al guardar' });
    } finally {
      setEnviando(false);
    }
  });

  // Si no hay datos todavía
  if (isLoading || !agenciaView) {
    return (
      <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
        <CardHeader title="Estilos de la Agencia" subheader="Cargando..." />
        <LinearProgress sx={{ mx: 2, mb: 2 }} />
      </Card>
    );
  }

  return (
    <>
      <FormProvider {...methods}>
        <form onSubmit={onSubmit}>
          <Card
            sx={{
              borderRadius: 2,
              boxShadow: 3,
              p: 0,
              display: 'flex',
              flexDirection: 'column',
              height: '80vh',
            }}
          >
            <CardHeader
              title="Estilos de la Agencia"
              subheader="Personalizá la identidad visual"
              sx={{
                textAlign: 'center',
                bgcolor: 'primary.light',
                color: 'white',
                borderTopLeftRadius: 8,
                borderTopRightRadius: 8,
                py: 2,
              }}
            />
            <Divider />
            <CardContent sx={{ flexGrow: 1, overflowY: 'auto', px: 3 }}>
              <Stack spacing={4} py={2}>
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
            </CardContent>
            <Divider />
            <CardActions sx={{ justifyContent: 'center', p: 2, gap: 2 }}>
              <Button
                variant="outlined"
                color="secondary"
                onClick={onReset}
                disabled={enviando}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={enviando || !formState.isDirty || !formState.isValid}
              >
                {enviando ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            </CardActions>
          </Card>
        </form>
      </FormProvider>

      {mensaje && (
        <Snackbar
          open
          autoHideDuration={4000}
          onClose={() => setMensaje(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setMensaje(null)}
            severity={mensaje.tipo}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {mensaje.texto}
          </Alert>
        </Snackbar>
      )}
    </>
  );
}
