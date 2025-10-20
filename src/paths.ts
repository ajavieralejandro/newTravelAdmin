export const paths = {
  home: '/',
  auth: {
    signIn: '/auth/sign-in',
    resetPassword: '/auth/reset-password',
  },
  dashboard: {
    overview: '/dashboard',
    account: '/dashboard/account',
    customers: '/dashboard/customers',
    integrations: '/dashboard/integrations',
    settings: '/dashboard/settings',
    paquetesPropios: '/dashboard/paquetesPropios',
    atlas: '/dashboard/atlas',
    mensajes: '/dashboard/mensajes', // ✅ agregado
  },
  errors: {
    notFound: '/errors/not-found',
  },
} as const;
