// components/dashboard/Estilos/sections/FooterSection.tsx
'use client';

import * as React from 'react';
import { Box, FormControl, Grid, InputLabel, OutlinedInput, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
// ✅ Tipo correcto desde el mapper (UI-ready)
import type { AgenciaFormValues } from '@/contexts/features/Agencias/services/agenciaMapper';

type AnyVal = string | null | undefined;

/** Hook de compatibilidad SOLO PARA LECTURA:
 *  Elige el primer nombre que exista en el form (canónico primero).
 */
function useCompatField(candidates: string[]) {
  const { getValues, watch } = useFormContext<AgenciaFormValues>();
  const [name, setName] = useState<string>(candidates[0]);

  useEffect(() => {
    for (const c of candidates) {
      // @ts-expect-error acceso dinámico
      const v = getValues(c);
      if (v !== undefined) {
        setName(c);
        return;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // @ts-expect-error watch dinámico
  const value: AnyVal = watch(name);
  return { name, value };
}

/** Input de texto simple (escribe SIEMPRE en la clave canónica) */
function FooterTextField({
  label,
  canonicalName,
  currentValue,
}: {
  label: string;
  canonicalName: keyof AgenciaFormValues;
  currentValue: AnyVal;
}) {
  const { setValue } = useFormContext<AgenciaFormValues>();
  return (
    <FormControl fullWidth>
      <InputLabel>{label}</InputLabel>
      <OutlinedInput
        label={label}
        value={currentValue ?? ''}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setValue(canonicalName as any, e.target.value, { shouldDirty: true, shouldTouch: true })
        }
      />
    </FormControl>
  );
}

/** Input de color + texto (escribe SIEMPRE en la clave canónica) */
function FooterColorField({
  label,
  canonicalName,
  currentValue,
  defaultColor = '#000000',
}: {
  label: string;
  canonicalName: keyof AgenciaFormValues;
  currentValue: AnyVal;
  defaultColor?: string;
}) {
  const { setValue } = useFormContext<AgenciaFormValues>();
  const val = currentValue ?? '';
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <input
        type="color"
        value={(currentValue ?? defaultColor) as string}
        onChange={(e) =>
          setValue(canonicalName as any, e.target.value, { shouldDirty: true, shouldTouch: true })
        }
        style={{ width: 40, height: 40, borderRadius: '50%', border: 'none' }}
      />
      <OutlinedInput
        value={val}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setValue(canonicalName as any, e.target.value, { shouldDirty: true, shouldTouch: true })
        }
      />
    </Box>
  );
}

export function FooterSection(): JSX.Element {
  // Visual/estilos — canónica primero en candidatos
  const textoR       = useCompatField(['footer_texto', 'footerTexto']);
  const tipografiaR  = useCompatField(['footer_tipografia', 'footerTipografia']);
  const tipColorR    = useCompatField(['footer_tipografia_color', 'footerTipografiaColor']);
  const colorPrimR   = useCompatField(['footer_color_primario', 'footerColorPrimario']);
  const colorSecR    = useCompatField(['footer_color_secundario', 'footerColorSecundario']);
  const colorTercR   = useCompatField(['footer_color_terciario', 'footerColorTerciario']);

  // Redes
  const facebookR    = useCompatField(['footer_facebook', 'footerFacebook']);
  const instagramR   = useCompatField(['footer_instagram', 'footerInstagram']);
  const twitterR     = useCompatField(['footer_twitter', 'footerTwitter']);
  const whatsappR    = useCompatField(['footer_whatsapp', 'footerWhatsapp']);

  // Contacto
  const emailR       = useCompatField(['footer_email', 'footerEmail']);
  const telefonoR    = useCompatField(['footer_telefono', 'footerTelefono']);

  // Ubicación
  const direccionR   = useCompatField(['footer_direccion', 'footerDireccion']);
  const ciudadR      = useCompatField(['footer_ciudad', 'footerCiudad']);
  const paisR        = useCompatField(['footer_pais', 'footerPais']);

  // 🔍 Log snapshot (compacto)
  React.useEffect(() => {
    const brief = (val: AnyVal) => (val === null ? null : String(val));
    console.groupCollapsed('[FooterSection] values snapshot');
    console.info({
      visual: {
        texto:        { readKey: textoR.name,      value: brief(textoR.value) },
        tipografia:   { readKey: tipografiaR.name, value: brief(tipografiaR.value) },
        tipColor:     { readKey: tipColorR.name,   value: brief(tipColorR.value) },
        colorPrim:    { readKey: colorPrimR.name,  value: brief(colorPrimR.value) },
        colorSec:     { readKey: colorSecR.name,   value: brief(colorSecR.value) },
        colorTerc:    { readKey: colorTercR.name,  value: brief(colorTercR.value) },
      },
      redes: {
        facebook:     { readKey: facebookR.name,   value: brief(facebookR.value) },
        instagram:    { readKey: instagramR.name,  value: brief(instagramR.value) },
        twitter:      { readKey: twitterR.name,    value: brief(twitterR.value) },
        whatsapp:     { readKey: whatsappR.name,   value: brief(whatsappR.value) },
      },
      contacto: {
        email:        { readKey: emailR.name,      value: brief(emailR.value) },
        telefono:     { readKey: telefonoR.name,   value: brief(telefonoR.value) },
      },
      ubicacion: {
        direccion:    { readKey: direccionR.name,  value: brief(direccionR.value) },
        ciudad:       { readKey: ciudadR.name,     value: brief(ciudadR.value) },
        pais:         { readKey: paisR.name,       value: brief(paisR.value) },
      },
    });
    console.groupEnd();
  }, [
    textoR.name, textoR.value,
    tipografiaR.name, tipografiaR.value,
    tipColorR.name, tipColorR.value,
    colorPrimR.name, colorPrimR.value,
    colorSecR.name, colorSecR.value,
    colorTercR.name, colorTercR.value,
    facebookR.name, facebookR.value,
    instagramR.name, instagramR.value,
    twitterR.name, twitterR.value,
    whatsappR.name, whatsappR.value,
    emailR.name, emailR.value,
    telefonoR.name, telefonoR.value,
    direccionR.name, direccionR.value,
    ciudadR.name, ciudadR.value,
    paisR.name, paisR.value,
  ]);

  return (
    <>
      <Typography variant="h6">Footer</Typography>
      <Grid container spacing={3}>
        {/* Visual / Estilos */}
        <Grid item xs={12}>
          <FooterTextField
            label="Texto del Footer"
            canonicalName="footer_texto"
            currentValue={textoR.value}
          />
        </Grid>

        <Grid item md={6} xs={12}>
          <FooterTextField
            label="Tipografía"
            canonicalName="footer_tipografia"
            currentValue={tipografiaR.value}
          />
        </Grid>

        <Grid item md={6} xs={12}>
          <Typography variant="body2">Color de Tipografía</Typography>
          <FooterColorField
            label="Color de Tipografía"
            canonicalName="footer_tipografia_color"
            currentValue={tipColorR.value}
          />
        </Grid>

        <Grid item md={4} xs={12}>
          <Typography variant="body2">Color primario</Typography>
          <FooterColorField
            label="Color primario"
            canonicalName="footer_color_primario"
            currentValue={colorPrimR.value}
          />
        </Grid>

        <Grid item md={4} xs={12}>
          <Typography variant="body2">Color secundario</Typography>
          <FooterColorField
            label="Color secundario"
            canonicalName="footer_color_secundario"
            currentValue={colorSecR.value}
          />
        </Grid>

        <Grid item md={4} xs={12}>
          <Typography variant="body2">Color terciario</Typography>
          <FooterColorField
            label="Color terciario"
            canonicalName="footer_color_terciario"
            currentValue={colorTercR.value}
          />
        </Grid>

        {/* Redes */}
        <Grid item md={6} xs={12}>
          <FooterTextField
            label="Facebook"
            canonicalName="footer_facebook"
            currentValue={facebookR.value}
          />
        </Grid>
        <Grid item md={6} xs={12}>
          <FooterTextField
            label="Instagram"
            canonicalName="footer_instagram"
            currentValue={instagramR.value}
          />
        </Grid>
        <Grid item md={6} xs={12}>
          <FooterTextField
            label="Twitter"
            canonicalName="footer_twitter"
            currentValue={twitterR.value}
          />
        </Grid>
        <Grid item md={6} xs={12}>
          <FooterTextField
            label="WhatsApp"
            canonicalName="footer_whatsapp"
            currentValue={whatsappR.value}
          />
        </Grid>

        {/* Contacto */}
        <Grid item md={6} xs={12}>
          <FooterTextField
            label="Email"
            canonicalName="footer_email"
            currentValue={emailR.value}
          />
        </Grid>
        <Grid item md={6} xs={12}>
          <FooterTextField
            label="Teléfono"
            canonicalName="footer_telefono"
            currentValue={telefonoR.value}
          />
        </Grid>

        {/* Ubicación */}
        <Grid item md={6} xs={12}>
          <FooterTextField
            label="Dirección"
            canonicalName="footer_direccion"
            currentValue={direccionR.value}
          />
        </Grid>
        <Grid item md={3} xs={12}>
          <FooterTextField
            label="Ciudad"
            canonicalName="footer_ciudad"
            currentValue={ciudadR.value}
          />
        </Grid>
        <Grid item md={3} xs={12}>
          <FooterTextField
            label="País"
            canonicalName="footer_pais"
            currentValue={paisR.value}
          />
        </Grid>
      </Grid>
    </>
  );
}
