// components/dashboard/Estilos/sections/AccountInfo.tsx
'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { useUserContext } from '@/contexts/user-context';

export function AccountInfo(): React.JSX.Element {
  const { agenciaView } = useUserContext();

  // Soporte logo: string (URL) o File (objectURL)
  const [logoObjectUrl, setLogoObjectUrl] = React.useState<string | null>(null);

  const logoSrc = React.useMemo(() => {
    const logo = agenciaView?.logo;
    if (!logo) return '/assets/avatar.png';
    if (typeof logo === 'string') return logo;
    if (logo instanceof File) {
      if (logoObjectUrl) return logoObjectUrl;
      const url = URL.createObjectURL(logo);
      setLogoObjectUrl(url);
      return url;
    }
    return '/assets/avatar.png';
  }, [agenciaView?.logo, logoObjectUrl]);

  React.useEffect(() => {
    return () => {
      if (logoObjectUrl) URL.revokeObjectURL(logoObjectUrl);
    };
  }, [logoObjectUrl]);

  if (!agenciaView) {
    return (
      <Card>
        <CardContent>
          <Typography variant="body2">Cargando datos de agencia...</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Stack spacing={2} sx={{ alignItems: 'center' }}>
          <Avatar src={logoSrc} sx={{ height: 80, width: 80 }} />
          <Stack spacing={1} sx={{ textAlign: 'center' }}>
            <Typography variant="h5">
              {agenciaView.nombre || 'Agencia desconocida'}
            </Typography>

            {(agenciaView.footer_ciudad || agenciaView.footer_pais) && (
              <Typography color="text.secondary" variant="body2">
                {agenciaView.footer_ciudad || ''} {agenciaView.footer_pais || ''}
              </Typography>
            )}

            {agenciaView.footer_email && (
              <Typography color="text.secondary" variant="body2">
                {agenciaView.footer_email}
              </Typography>
            )}
          </Stack>
        </Stack>
      </CardContent>

      <Divider />
      {/* Solo lectura: sin acciones ni uploads */}
    </Card>
  );
}
