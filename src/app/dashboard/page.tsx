import * as React from 'react';
import type { Metadata } from 'next';
import Box from '@mui/material/Box';
import { config } from '@/config';

export const metadata = {
  title: `Overview | Dashboard | ${config.site.name}`,
} satisfies Metadata;

const HEADER_PX = 64; // ajustá si tu topbar mide otra cosa

export default function Page(): React.JSX.Element {
  return (
    <Box
      sx={{
        width: '100%',
        height: `calc(100dvh - ${HEADER_PX}px)`,
        backgroundImage: 'url(/assets/Dashboard.jpeg)',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundSize: 'contain',     // 👈 se ve completa, sin recortes
        bgcolor: 'background.default', // color de “marcos” si sobran bordes
      }}
    />
  );
}
