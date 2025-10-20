'use client';

import * as React from 'react';
import RouterLink from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Link from '@mui/material/Link';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Eye as EyeIcon } from '@phosphor-icons/react/dist/ssr/Eye';
import { EyeSlash as EyeSlashIcon } from '@phosphor-icons/react/dist/ssr/EyeSlash';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import { paths } from '@/paths';
import { authClient } from '@/lib/auth/client';
import { useUserContext } from '@/contexts/user-context';

const schema = zod.object({
  email: zod.string().min(1, { message: 'El email es obligatorio' }).email(),
  password: zod.string().min(1, { message: 'La contraseña es obligatoria' }),
});

type Values = zod.infer<typeof schema>;

const defaultValues: Values = {
  email: '',
  password: '',
};

export function SignInForm(): React.JSX.Element {
  const router = useRouter();
  const { checkSession, isLoading, error } = useUserContext();

  const [showPassword, setShowPassword] = React.useState(false);
  const [isPending, setIsPending] = React.useState(false);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Values>({ defaultValues, resolver: zodResolver(schema) });

  const onSubmit = React.useCallback(
    async (values: Values): Promise<void> => {
      setIsPending(true);

      const { error: loginError } = await authClient.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (loginError) {
        setError('root', { type: 'server', message: loginError });
        setIsPending(false);
        return;
      }

      await checkSession?.();
      router.refresh();
    },
    [checkSession, router, setError]
  );

  if (isLoading) return <div>Cargando...</div>;
  if (error) return <Alert color="error">Ocurrió un error inesperado</Alert>;

  return (
    <Stack spacing={4}>
      <Typography variant="h4">Iniciar sesión</Typography>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Stack spacing={2}>
          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <FormControl error={Boolean(errors.email)} fullWidth variant="outlined">
                <OutlinedInput
                  {...field}
                  id="email"
                  type="email"
                  placeholder="Correo electrónico"
                  autoComplete="email"
                />
                {errors.email && <FormHelperText>{errors.email.message}</FormHelperText>}
              </FormControl>
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <FormControl error={Boolean(errors.password)} fullWidth variant="outlined">
                <OutlinedInput
                  {...field}
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Contraseña"
                  autoComplete="current-password"
                  endAdornment={
                    showPassword ? (
                      <EyeIcon
                        cursor="pointer"
                        fontSize="var(--icon-fontSize-md)"
                        onClick={() => setShowPassword(false)}
                      />
                    ) : (
                      <EyeSlashIcon
                        cursor="pointer"
                        fontSize="var(--icon-fontSize-md)"
                        onClick={() => setShowPassword(true)}
                      />
                    )
                  }
                />
                {errors.password && <FormHelperText>{errors.password.message}</FormHelperText>}
              </FormControl>
            )}
          />

          <div>
            <Link component={RouterLink} href={paths.auth.resetPassword} variant="subtitle2">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          {errors.root && <Alert color="error">{errors.root.message}</Alert>}

          <Button disabled={isPending} type="submit" variant="contained">
            Iniciar sesión
          </Button>
        </Stack>
      </form>
    </Stack>
  );
}
