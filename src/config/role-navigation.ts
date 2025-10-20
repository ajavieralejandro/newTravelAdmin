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

// ✅ NUEVO: ruta de inicio por rol
export const roleDefaultRoute: Record<RolUsuario, string> = {
  admin: paths.dashboard.atlas,        // o la que prefieras
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
  // Si "Estilos" ya no va, podés borrarlo o dejarlo así.
  {
    label: 'Estilos',
    href: '/dashboard/integrations',
    matcher: { type: 'startsWith', href: '/dashboard/integrations' },
    icon: 'palette',
    roles: ['admin'],
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
  // ✅ NUEVO/CORREGIDO: Atlas (fijate la barra inicial en matcher.href)
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
