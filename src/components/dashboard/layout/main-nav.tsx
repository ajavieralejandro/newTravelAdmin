// components/layout/main-nav.tsx (o donde corresponda)
'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import { Bell as BellIcon } from '@phosphor-icons/react/dist/ssr/Bell';
import { List as ListIcon } from '@phosphor-icons/react/dist/ssr/List';
import { MagnifyingGlass as MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';
import { Users as UsersIcon } from '@phosphor-icons/react/dist/ssr/Users';

import { usePopover } from '@/hooks/use-popover';
import { useUserContext } from '@/contexts/user-context';

import { MobileNav } from './mobile-nav';
import { UserPopover } from './user-popover';

export function MainNav(): React.JSX.Element {
  const [openNav, setOpenNav] = React.useState<boolean>(false);
  const userPopover = usePopover<HTMLDivElement>();
  const { agenciaView, user } = useUserContext();

  // Soporte logo: string (URL) o File (objectURL)
  const [logoObjectUrl, setLogoObjectUrl] = React.useState<string | null>(null);

  const logoSrc = React.useMemo(() => {
    const logo = agenciaView?.logo;

    if (!logo) return '/assets/avatar.png';
    if (typeof logo === 'string') return logo;

    // File → generar/reusar objectURL
    if (logo instanceof File) {
      if (logoObjectUrl) return logoObjectUrl;
      const url = URL.createObjectURL(logo);
      setLogoObjectUrl(url);
      return url;
    }

    return '/assets/avatar.png';
  }, [agenciaView?.logo, logoObjectUrl]);

  // Revocar el objectURL cuando cambie el File o se desmonte
  React.useEffect(() => {
    return () => {
      if (logoObjectUrl) {
        URL.revokeObjectURL(logoObjectUrl);
      }
    };
  }, [logoObjectUrl]);

  return (
    <>
      <Box
        component="header"
        sx={{
          borderBottom: '1px solid var(--mui-palette-divider)',
          backgroundColor: 'var(--mui-palette-background-paper)',
          position: 'sticky',
          top: 0,
          zIndex: 'var(--muiZIndex-appBar)',
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          sx={{ alignItems: 'center', justifyContent: 'space-between', minHeight: '64px', px: 2 }}
        >
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <IconButton
              aria-label="Abrir navegación"
              onClick={() => setOpenNav(true)}
              sx={{ display: { lg: 'none' } }}
            >
              <ListIcon />
            </IconButton>

            <Tooltip title="Búsqueda">
              <IconButton aria-label="Abrir búsqueda">
                <MagnifyingGlassIcon />
              </IconButton>
            </Tooltip>
          </Stack>

          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <Tooltip title="Contactos">
              <IconButton aria-label="Abrir contactos">
                <UsersIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Notificaciones">
              <Badge badgeContent={4} color="success" variant="dot">
                <IconButton aria-label="Abrir notificaciones">
                  <BellIcon />
                </IconButton>
              </Badge>
            </Tooltip>

            <Avatar
              alt={agenciaView?.nombre || user?.nombre || 'Agencia'}
              onClick={userPopover.handleOpen}
              ref={userPopover.anchorRef}
              src={logoSrc}
              sx={{ cursor: 'pointer' }}
            />
          </Stack>
        </Stack>
      </Box>

      <UserPopover
        anchorEl={userPopover.anchorRef.current}
        onClose={userPopover.handleClose}
        open={userPopover.open}
      />
      <MobileNav onClose={() => setOpenNav(false)} open={openNav} />
    </>
  );
}
