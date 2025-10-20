// components/dashboard/Estilos/sections/BannerRegistroSection.tsx
'use client';

import * as React from 'react';
import { Box, FormControl, Grid, InputLabel, OutlinedInput, Typography } from '@mui/material';
import { useFormContext, useWatch } from 'react-hook-form';
// ✅ Tipo correcto desde el mapper
import type { AgenciaFormValues } from '@/contexts/features/Agencias/services/agenciaMapper';

// --- Componentes fuera del render para evitar react/no-unstable-nested-components ---
type BannerColorKey =
  | 'banner_registro_tipografia_color'
  | 'banner_registro_color_primario'
  | 'banner_registro_color_secundario'
  | 'banner_registro_color_terciario';

interface BannerColorFieldProps {
  label: string;
  name: BannerColorKey;
  value?: string | null;
  defaultColor?: string;
}

function BannerColorField({ label, name, value, defaultColor = '#000000' }: BannerColorFieldProps) {
  const { setValue } = useFormContext<AgenciaFormValues>();
  const inputValue = value ?? '';

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <input
        type="color"
        value={(value ?? defaultColor) as string}
        onChange={(e) => setValue(name, e.target.value, { shouldDirty: true, shouldTouch: true })}
        style={{ width: 40, height: 40, borderRadius: '50%', border: 'none' }}
      />
      <OutlinedInput
        name={name}
        value={inputValue}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setValue(name, e.target.value, { shouldDirty: true, shouldTouch: true })
        }
      />
    </Box>
  );
}

export function BannerRegistroSection(): JSX.Element {
  const { control, setValue } = useFormContext<AgenciaFormValues>();

  // Claves canónicas en snake_case (consts camel para eslint)
  const kBannerTitulo = 'banner_registro_titulo' as const;
  const kBannerTipografiaColor = 'banner_registro_tipografia_color' as const;
  const kBannerColorPrimario = 'banner_registro_color_primario' as const;
  const kBannerColorSecundario = 'banner_registro_color_secundario' as const;
  const kBannerColorTerciario = 'banner_registro_color_terciario' as const;

  // 🔍 useWatch: names snake_case, alias locales camelCase
  const [
    bannerTitulo,
    bannerTipografiaColor,
    bannerColorPrimario,
    bannerColorSecundario,
    bannerColorTerciario,
  ] = useWatch({
    control,
    name: [
      kBannerTitulo,
      kBannerTipografiaColor,
      kBannerColorPrimario,
      kBannerColorSecundario,
      kBannerColorTerciario,
    ],
  });

  // 🔍 Log snapshot
  React.useEffect(() => {
    console.groupCollapsed('[BannerRegistroSection] values snapshot');
    console.info({
      bannerTitulo,
      bannerTipografiaColor,
      bannerColorPrimario,
      bannerColorSecundario,
      bannerColorTerciario,
    });
    console.groupEnd();
  }, [bannerTitulo, bannerTipografiaColor, bannerColorPrimario, bannerColorSecundario, bannerColorTerciario]);

  return (
    <>
      <Typography variant="h6">Banner de Registro</Typography>
      <Grid container spacing={3}>
        <Grid item md={6} xs={12}>
          <FormControl fullWidth>
            <InputLabel>Título del Banner</InputLabel>
            <OutlinedInput
              name={kBannerTitulo}
              label="Título del Banner"
              value={bannerTitulo || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setValue(kBannerTitulo, e.target.value, { shouldDirty: true, shouldTouch: true })
              }
            />
          </FormControl>
        </Grid>

        <Grid item md={6} xs={12}>
          <Typography variant="body2">Color de Tipografía</Typography>
          <BannerColorField
            label="Color de Tipografía"
            name={kBannerTipografiaColor}
            value={bannerTipografiaColor}
          />
        </Grid>

        <Grid item md={4} xs={12}>
          <Typography variant="body2">Color primario</Typography>
          <BannerColorField
            label="Color primario"
            name={kBannerColorPrimario}
            value={bannerColorPrimario}
          />
        </Grid>

        <Grid item md={4} xs={12}>
          <Typography variant="body2">Color secundario</Typography>
          <BannerColorField
            label="Color secundario"
            name={kBannerColorSecundario}
            value={bannerColorSecundario}
          />
        </Grid>

        <Grid item md={4} xs={12}>
          <Typography variant="body2">Color terciario</Typography>
          <BannerColorField
            label="Color terciario"
            name={kBannerColorTerciario}
            value={bannerColorTerciario}
          />
        </Grid>
      </Grid>
    </>
  );
}
