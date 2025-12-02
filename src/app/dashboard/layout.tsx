// app/dashboard/layout.tsx
'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import GlobalStyles from '@mui/material/GlobalStyles';
import { usePathname, useRouter } from 'next/navigation';

import { AuthGuard } from '@/components/auth/auth-guard';
import { MainNav } from '@/components/dashboard/layout/main-nav';
import { SideNav } from '@/components/dashboard/layout/side-nav';

import { navItems, roleDefaultRoute } from '@/config/role-navigation';
import { useUserContext } from '@/contexts/user-context';
import { paths } from '@/paths';
import type { RolUsuario } from '@/config/role-navigation';

interface LayoutProps {
  children: React.ReactNode;
}

/**
 * Determina si una ruta está permitida para un rol dado,
 * usando la configuración de navItems.
 */
function isAllowed(pathname: string, role: RolUsuario): boolean {
  // Permití siempre el índice para poder redirigir desde ahí
  if (pathname === paths.dashboard.overview) return true;

  return navItems.some((item) => {
    if (!item.roles.includes(role)) return false;

    const matchHref = item.matcher?.href ?? item.href;
    const type = item.matcher?.type ?? 'equals';

    return type === 'startsWith'
      ? pathname.startsWith(matchHref)
      : pathname === matchHref;
  });
}

export default function Layout({ children }: LayoutProps): React.JSX.Element {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading } = useUserContext();

  React.useEffect(() => {
    if (isLoading || !user) return;

    // Home por rol (definilo en role-navigation.ts)
    const home = roleDefaultRoute?.[user.rol] ?? paths.dashboard.overview;

    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.log({
        pathname,
        role: user.rol,
        allowed: isAllowed(pathname, user.rol),
        home,
      });
    }

    // Si estás parado en /dashboard (índice), mandá al home por rol
    if (pathname === paths.dashboard.overview) {
      if (pathname !== home) router.replace(home);
      return;
    }

    // Si la ruta no está permitida para el rol, mandá al home por rol
    if (!isAllowed(pathname, user.rol)) {
      if (pathname !== home) router.replace(home);
    }
  }, [isLoading, user, pathname, router]);

  return (
    <AuthGuard>
      <GlobalStyles
        styles={{
          body: {
            '--MainNav-height': '56px',
            '--MainNav-zIndex': 1000,
            '--SideNav-width': '280px',
            '--SideNav-zIndex': 1100,
            '--MobileNav-width': '320px',
            '--MobileNav-zIndex': 1100,
          },
        }}
      />
      <Box
        sx={{
          bgcolor: 'var(--mui-palette-background-default)',
          display: 'flex',
          flexDirection: 'row',
          position: 'relative',
          minHeight: '100%',
        }}
      >
        {/* Lateral fijo */}
        <SideNav />

        {/* Columna principal (navbar superior + contenido) */}
        <Box
          sx={{
            display: 'flex',
            flex: '1 1 auto',
            flexDirection: 'column',
            pl: { lg: 'var(--SideNav-width)' }, // deja espacio lateral cuando el side nav está fijo
          }}
        >
          {/* Navbar superior sticky */}
          <Box
            component="header"
            sx={(theme) => ({
              position: 'sticky',
              top: 0,
              zIndex: 'var(--MainNav-zIndex)',
              bgcolor: theme.palette.background.paper,
              borderBottom: `1px solid ${theme.palette.divider}`,
            })}
          >
            <MainNav />
          </Box>

          {/* Contenido principal */}
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              pt: 2, // ya no hace falta compensar manualmente la altura del navbar
              pb: 4,
            }}
          >
            <Container maxWidth="xl">
              {children}
            </Container>
          </Box>
        </Box>
      </Box>
    </AuthGuard>
  );
}
