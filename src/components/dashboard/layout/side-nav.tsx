// components/dashboard/layout/side-nav.tsx
'use client';

import * as React from 'react';
import RouterLink from 'next/link';
import { usePathname } from 'next/navigation';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { CaretUpDown as CaretUpDownIcon } from '@phosphor-icons/react/dist/ssr/CaretUpDown';

import { isNavItemActive } from '@/lib/is-nav-item-active';
import { navItems } from '@/config/role-navigation';
import { navIcons } from './nav-icons';

import { useUserContext } from '@/contexts/user-context';
import type { NavItem as NavItemConfig } from '@/config/role-navigation';

export function SideNav(): React.JSX.Element {
  const pathname = usePathname();
  const { user, isLoading, agenciaView } = useUserContext();

  // Soporte logo: string (URL) o File (objectURL)
  const [logoObjectUrl, setLogoObjectUrl] = React.useState<string | null>(null);

  const logoSrc = React.useMemo(() => {
    const logo = (agenciaView as any)?.logo;
    if (!logo) return '/assets/avatar.png';
    if (typeof logo === 'string') return logo;
    if (logo instanceof File) {
      if (logoObjectUrl) return logoObjectUrl;
      const url = URL.createObjectURL(logo);
      setLogoObjectUrl(url);
      return url;
    }
    return '/assets/avatar.png';
  }, [agenciaView, logoObjectUrl]);

  React.useEffect(() => {
    return () => {
      if (logoObjectUrl) URL.revokeObjectURL(logoObjectUrl);
    };
  }, [logoObjectUrl]);

  if (isLoading || !user) return <></>;

  // Ocultamos enlaces específicos (independiente del role-navigation)
  const hiddenHrefs = new Set<string>([
    '/dashboard',            // inicio ya se resalta con matcher
    '/dashboard/settings',
    '/dashboard/account',    // ocultar Perfil del menú
  ]);

  // ⛔ Ocultar Servicios si NO es superadmin (defensa extra)
  if (user.rol !== 'superadmin') {
    hiddenHrefs.add('/dashboard/servicios');
  }

  const visibleNavItems = navItems
    .filter((item) => item.roles.includes(user.rol))
    .filter((item) => !hiddenHrefs.has(item.href));

  return (
    <Box
      sx={{
        '--SideNav-background': 'var(--mui-palette-neutral-950)',
        '--SideNav-color': 'var(--mui-palette-common-white)',
        '--NavItem-color': 'var(--mui-palette-neutral-300)',
        '--NavItem-hover-background': 'rgba(255, 255, 255, 0.04)',
        '--NavItem-active-background': 'var(--mui-palette-primary-main)',
        '--NavItem-active-color': 'var(--mui-palette-primary-contrastText)',
        '--NavItem-disabled-color': 'var(--mui-palette-neutral-500)',
        '--NavItem-icon-color': 'var(--mui-palette-neutral-400)',
        '--NavItem-icon-active-color': 'var(--mui-palette-primary-contrastText)',
        '--NavItem-icon-disabled-color': 'var(--mui-palette-neutral-600)',
        bgcolor: 'var(--SideNav-background)',
        color: 'var(--SideNav-color)',
        display: { xs: 'none', lg: 'flex' },
        flexDirection: 'column',
        height: '100%',
        left: 0,
        maxWidth: '100%',
        position: 'fixed',
        scrollbarWidth: 'none',
        top: 0,
        width: 'var(--SideNav-width)',
        zIndex: 'var(--SideNav-zIndex)',
        '&::-webkit-scrollbar': { display: 'none' },
      }}
    >
      <Stack spacing={2} sx={{ p: 3 }}>
        <Box
          sx={{
            alignItems: 'center',
            backgroundColor: 'var(--mui-palette-neutral-950)',
            border: '1px solid var(--mui-palette-neutral-700)',
            borderRadius: '12px',
            cursor: 'default',
            display: 'flex',
            p: '4px 12px',
            gap: 1.5,
          }}
        >
          <Box
            component="img"
            src={logoSrc}
            alt="Logo agencia"
            sx={{ width: 32, height: 32, borderRadius: 1, objectFit: 'cover' }}
          />
          <Box sx={{ flex: '1 1 auto', overflow: 'hidden' }}>
            <Typography color="var(--mui-palette-neutral-400)" variant="body2">
              Área de trabajo
            </Typography>
            <Typography
              color="inherit"
              variant="subtitle1"
              noWrap
              sx={{ fontWeight: 600, fontSize: '0.95rem' }}
            >
              {(agenciaView as any)?.nombre ?? 'Agencia'}
            </Typography>
          </Box>
          <CaretUpDownIcon />
        </Box>
      </Stack>

      <Divider sx={{ borderColor: 'var(--mui-palette-neutral-700)' }} />

      <Box component="nav" sx={{ flex: '1 1 auto', p: '12px' }}>
        {renderNavItems({ pathname, items: visibleNavItems })}
      </Box>

      <Divider sx={{ borderColor: 'var(--mui-palette-neutral-700)' }} />
    </Box>
  );
}

function renderNavItems({
  items = [],
  pathname,
}: {
  items?: NavItemConfig[];
  pathname: string;
}): React.JSX.Element {
  const children = items.map((item) => (
    <NavItem
      key={item.href}
      pathname={pathname}
      href={item.href}
      icon={typeof item.icon === 'string' ? item.icon : undefined}
      matcher={item.matcher}
      disabled={false}
      external={false}
      title={item.label || ''}
    />
  ));

  return (
    <Stack component="ul" spacing={1} sx={{ listStyle: 'none', m: 0, p: 0 }}>
      {children}
    </Stack>
  );
}

interface NavItemProps {
  disabled?: boolean;
  external?: boolean;
  href: string;
  icon?: string;
  matcher?: {
    type: 'startsWith' | 'equals';
    href: string;
  };
  pathname: string;
  title: string;
}

function NavItem({
  disabled,
  external,
  href,
  icon,
  matcher,
  pathname,
  title,
}: NavItemProps): React.JSX.Element {
  const active = isNavItemActive({ disabled, external, href, matcher, pathname });
  const IconComp = icon ? navIcons[icon] : null;

  return (
    <li>
      <Box
        {...(href
          ? {
              component: external ? 'a' : RouterLink,
              href,
              target: external ? '._blank' : undefined,
              rel: external ? 'noreferrer' : undefined,
            }
          : { role: 'button' })}
        sx={{
          alignItems: 'center',
          borderRadius: 1,
          color: 'var(--NavItem-color)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          display: 'flex',
          flex: '0 0 auto',
          gap: 1,
          p: '6px 16px',
          position: 'relative',
          textDecoration: 'none',
          whiteSpace: 'nowrap',
          ...(disabled && {
            bgcolor: 'var(--NavItem-disabled-background)',
            color: 'var(--NavItem-disabled-color)',
          }),
          ...(active && {
            bgcolor: 'var(--NavItem-active-background)',
            color: 'var(--NavItem-active-color)',
          }),
          '&:hover': !disabled ? { bgcolor: 'var(--NavItem-hover-background)' } : undefined,
        }}
      >
        <Box
          sx={{
            alignItems: 'center',
            display: 'flex',
            justifyContent: 'center',
            flex: '0 0 auto',
          }}
        >
          {IconComp ? (
            <IconComp
              size={20}
              color={active ? 'var(--NavItem-icon-active-color)' : 'var(--NavItem-icon-color)'}
              weight={active ? 'fill' : 'regular'}
            />
          ) : null}
        </Box>
        <Box sx={{ flex: '1 1 auto' }}>
          <Typography
            component="span"
            sx={{ color: 'inherit', fontSize: '0.875rem', fontWeight: 500, lineHeight: '28px' }}
          >
            {title}
          </Typography>
        </Box>
      </Box>
    </li>
  );
}
