// components/dashboard/Estilos/sections/AccountDetailsForm.tsx
'use client';

import * as React from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  Divider,
  FormControl,
  InputLabel,
  OutlinedInput,
  Grid,
  Typography,
  Button,
} from '@mui/material';

import { useUserContext } from '@/contexts/user-context';

export function AccountDetailsForm(): React.JSX.Element {
  const { agenciaView } = useUserContext();

  if (!agenciaView) {
    return (
      <Card>
        <CardContent>
          <Typography variant="body2">Cargando datos de agencia...</Typography>
        </CardContent>
      </Card>
    );
  }

  const verPDF = () => {
    const url = typeof agenciaView.terminos_y_condiciones === 'string' ? agenciaView.terminos_y_condiciones : '';
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card>
      <CardHeader title="Perfil de la Agencia (solo lectura)" subheader="Datos institucionales, contacto y redes" />
      <Divider />
      <CardContent>
        <Grid container spacing={3}>
          {/* Nombre */}
          <Grid item md={6} xs={12}>
            <FormControl fullWidth>
              <InputLabel shrink>Nombre de la Agencia</InputLabel>
              <OutlinedInput value={agenciaView.nombre || ''} readOnly disabled label="Nombre de la Agencia" />
            </FormControl>
          </Grid>

          {/* Contacto */}
          <Grid item md={6} xs={12}>
            <FormControl fullWidth>
              <InputLabel shrink>Email de contacto</InputLabel>
              <OutlinedInput value={agenciaView.footer_email || ''} readOnly disabled label="Email de contacto" />
            </FormControl>
          </Grid>

          <Grid item md={6} xs={12}>
            <FormControl fullWidth>
              <InputLabel shrink>Teléfono</InputLabel>
              <OutlinedInput value={agenciaView.footer_telefono || ''} readOnly disabled label="Teléfono" />
            </FormControl>
          </Grid>

          {/* Ubicación */}
          <Grid item md={6} xs={12}>
            <FormControl fullWidth>
              <InputLabel shrink>Dirección</InputLabel>
              <OutlinedInput value={agenciaView.footer_direccion || ''} readOnly disabled label="Dirección" />
            </FormControl>
          </Grid>

          <Grid item md={6} xs={12}>
            <FormControl fullWidth>
              <InputLabel shrink>Ciudad</InputLabel>
              <OutlinedInput value={agenciaView.footer_ciudad || ''} readOnly disabled label="Ciudad" />
            </FormControl>
          </Grid>

          <Grid item md={6} xs={12}>
            <FormControl fullWidth>
              <InputLabel shrink>País</InputLabel>
              <OutlinedInput value={agenciaView.footer_pais || ''} readOnly disabled label="País" />
            </FormControl>
          </Grid>

          {/* Información institucional */}
          <Grid item xs={12}>
            <Typography variant="subtitle1">Quiénes somos</Typography>
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel shrink>Español</InputLabel>
              <OutlinedInput
                value={agenciaView.quienes_somos_es || ''}
                readOnly
                disabled
                label="Español"
                multiline
                minRows={2}
              />
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel shrink>Inglés</InputLabel>
              <OutlinedInput
                value={agenciaView.quienes_somos_en || ''}
                readOnly
                disabled
                label="Inglés"
                multiline
                minRows={2}
              />
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel shrink>Portugués</InputLabel>
              <OutlinedInput
                value={agenciaView.quienes_somos_pt || ''}
                readOnly
                disabled
                label="Portugués"
                multiline
                minRows={2}
              />
            </FormControl>
          </Grid>

          {/* Redes sociales */}
          <Grid item xs={12}>
            <Typography variant="subtitle1">Redes sociales</Typography>
          </Grid>

          <Grid item md={6} xs={12}>
            <FormControl fullWidth>
              <InputLabel shrink>Facebook</InputLabel>
              <OutlinedInput value={agenciaView.footer_facebook || ''} readOnly disabled label="Facebook" />
            </FormControl>
          </Grid>

          <Grid item md={6} xs={12}>
            <FormControl fullWidth>
              <InputLabel shrink>Instagram</InputLabel>
              <OutlinedInput value={agenciaView.footer_instagram || ''} readOnly disabled label="Instagram" />
            </FormControl>
          </Grid>

          <Grid item md={6} xs={12}>
            <FormControl fullWidth>
              <InputLabel shrink>Twitter</InputLabel>
              <OutlinedInput value={agenciaView.footer_twitter || ''} readOnly disabled label="Twitter" />
            </FormControl>
          </Grid>

          <Grid item md={6} xs={12}>
            <FormControl fullWidth>
              <InputLabel shrink>WhatsApp</InputLabel>
              <OutlinedInput value={agenciaView.footer_whatsapp || ''} readOnly disabled label="WhatsApp" />
            </FormControl>
          </Grid>

          {/* Términos y condiciones (URL) */}
          <Grid item xs={12}>
            <Typography variant="subtitle1">Términos y condiciones</Typography>
          </Grid>

          <Grid item xs={12} sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <FormControl fullWidth>
              <InputLabel shrink>URL del PDF</InputLabel>
              <OutlinedInput
                value={typeof agenciaView.terminos_y_condiciones === 'string' ? agenciaView.terminos_y_condiciones : ''}
                readOnly
                disabled
                label="URL del PDF"
                placeholder="https://…/terminos_y_condiciones.pdf"
              />
            </FormControl>

            <Button
              variant="outlined"
              color="secondary"
              disabled={typeof agenciaView.terminos_y_condiciones !== 'string' || !agenciaView.terminos_y_condiciones}
              onClick={verPDF}
            >
              Ver PDF
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
