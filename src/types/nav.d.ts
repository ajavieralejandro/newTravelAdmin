export interface NavItemConfig {
  key: string;
  title?: string;
  disabled?: boolean;
  external?: boolean;
  label?: string;
  icon?: string;
  href?: string;
  items?: NavItemConfig[];
  matcher?: { type: 'startsWith' | 'equals'; href: string };

  /** Roles permitidos para ver este ítem en el menú lateral */
  roles?: string[]; // 👈 agregado
}
