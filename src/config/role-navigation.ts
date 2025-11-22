import type { ReactNode } from 'react';
import { paths } from '@/paths';

export type RolUsuario = 'admin' | 'superadmin';

export interface NavItem {
  label: string;
  href: string;
  icon?: ReactNode | string;
  matcher?: { type: 'startsWith' | 'equals'; href: string };
  roles: RolUsuario[];
}

// ✅ Ruta de inicio por rol (la dejo igual)
export const roleDefaultRoute: Record<RolUsuario, string> = {
  admin: paths.dashboard.atlas,
  superadmin: paths.dashboard.customers,
};

export const navItems: NavItem[] = [
  {
    label: 'Inicio',
    href: '/dashboard',
    matcher: { type: 'equals', href: '/dashboard' },
    icon: 'chart-pie',
    roles: ['admin', 'superadmin'],
  },
  {
    label: 'Agencias',
    href: '/dashboard/customers',
    matcher: { type: 'startsWith', href: '/dashboard/customers' },
    icon: 'users',
    roles: ['superadmin'],
  },
  {
    label: 'Servicios',
    href: '/dashboard/servicios',
    matcher: { type: 'startsWith', href: '/dashboard/servicios' },
    icon: 'servicios',
    roles: ['admin','superadmin'],
  },

  // 🔹 Estilos ahora tiene SU propia ruta
  {
    label: 'Estilos',
    href: '/dashboard/estilos',
    matcher: { type: 'startsWith', href: '/dashboard/estilos' },
    icon: 'palette',
    roles: ['admin'],
  },

  // 🔹 Integraciones se queda para cosas de API (Atlas, TravelGateX, etc.)
  {
    label: 'Integraciones',
    href: '/dashboard/integrations',
    matcher: { type: 'startsWith', href: '/dashboard/integrations' },
    icon: 'plug',
    roles: ['admin', 'superadmin'],
  },

  {
    label: 'Paquetes Propios',
    href: '/dashboard/paquetesPropios',
    matcher: { type: 'startsWith', href: '/dashboard/paquetesPropios' },
    icon: 'package',
    roles: ['admin', 'superadmin'],
  },
  {
    label: 'Mensajes',
    href: '/dashboard/mensajes',
    matcher: { type: 'startsWith', href: '/dashboard/mensajes' },
    icon: 'messages',
    roles: ['admin'],
  },
  {
    label: 'Perfil',
    href: '/dashboard/account',
    matcher: { type: 'startsWith', href: '/dashboard/account' },
    icon: 'users',
    roles: ['admin', 'superadmin'],
  },
  {
    label: 'Atlas',
    href: '/dashboard/atlas',
    matcher: { type: 'startsWith', href: '/dashboard/atlas' },
    icon: 'lan',
    roles: ['admin', 'superadmin'],
  },
  {
    label: 'Configuración',
    href: '/dashboard/settings',
    matcher: { type: 'startsWith', href: '/dashboard/settings' },
    icon: 'gear-six',
    roles: ['admin', 'superadmin'],
  },
];
