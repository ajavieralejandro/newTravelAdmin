// components/dashboard/layout/user-popover.tsx
'use client';

import * as React from 'react';
import RouterLink from 'next/link';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import ListItemIcon from '@mui/material/ListItemIcon';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import { SignOut as SignOutIcon } from '@phosphor-icons/react/dist/ssr/SignOut';
import { User as UserIcon } from '@phosphor-icons/react/dist/ssr/User';

import { paths } from '@/paths';
import { authClient } from '@/lib/auth/client';
import { useUserContext } from '@/contexts/user-context';

export interface UserPopoverProps {
  anchorEl: Element | null;
  onClose: () => void;
  open: boolean;
}

export function UserPopover({ anchorEl, onClose, open }: UserPopoverProps): React.JSX.Element {
  const router = useRouter();
  const { checkSession, agenciaView } = useUserContext();

  const handleSignOut = React.useCallback(async (): Promise<void> => {
    try {
      const { error } = await authClient.signOut();
      if (error) {
        console.error('[UserPopover] Error al cerrar sesión:', error);
        return;
      }

      await checkSession();
      onClose();
      router.refresh();
      // Si preferís redirigir explícitamente:
      // router.replace(paths.auth.signIn);
    } catch (err) {
      console.error('[UserPopover] Excepción al cerrar sesión:', err);
    }
  }, [checkSession, onClose, router]);

  return (
    <Popover
      anchorEl={anchorEl}
      anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
      onClose={onClose}
      open={open}
      slotProps={{ paper: { sx: { width: '240px' } } }}
    >
      <Box sx={{ p: '16px 20px' }}>
        <Typography variant="subtitle1">
          {agenciaView?.nombre ?? 'Agencia desconocida'}
        </Typography>
        {agenciaView?.footer_email && (
          <Typography color="text.secondary" variant="body2">
            {agenciaView.footer_email}
          </Typography>
        )}
      </Box>

      <Divider />

      <MenuList disablePadding sx={{ p: '8px', '& .MuiMenuItem-root': { borderRadius: 1 } }}>
        <MenuItem component={RouterLink} href={paths.dashboard.account} onClick={onClose}>
          <ListItemIcon>
            <UserIcon fontSize="var(--icon-fontSize-md)" />
          </ListItemIcon>
          Perfil
        </MenuItem>

        <MenuItem onClick={handleSignOut}>
          <ListItemIcon>
            <SignOutIcon fontSize="var(--icon-fontSize-md)" />
          </ListItemIcon>
          Cerrar sesión
        </MenuItem>
      </MenuList>
    </Popover>
  );
}
