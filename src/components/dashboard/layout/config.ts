import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';

export const navItems = [
  {
    key: 'customers',
    title: 'Agencias',
    href: paths.dashboard.customers,
    icon: 'users',
    roles: ['admin', 'superadmin'],
  },
  {
    key: 'integrations',
    title: 'Estilos',
    href: paths.dashboard.integrations,
    icon: 'plugs-connected',
    roles: ['admin'], // ❌ oculto para superadmin
  },
  {
    key: 'settings',
    title: 'Configuracion',
    href: paths.dashboard.settings,
    icon: 'gear-six',
    roles: ['admin', 'superadmin'],
  },
  {
    key: 'account',
    title: 'Consultas',
    href: paths.dashboard.account,
    icon: 'user',
    roles: ['admin', 'superadmin'],
  },
  {
    key: 'paquetesPropios',
    title: 'Paquetes Propios',
    href: paths.dashboard.paquetesPropios,
    icon: 'package',
    roles: ['superadmin'], // ✅ solo superadmin
  },
] satisfies NavItemConfig[];
