/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  typescript: {
    ignoreBuildErrors: true, // ✅ Ignora errores TS en producción
  },
  eslint: {
    ignoreDuringBuilds: true, // ✅ Ignora errores de lint en producción
  },
  compiler: {
    emotion: true,
  },
  images: {
    domains: ['localhost'],
  },
  experimental: {
    esmExternals: 'loose',
    // ⛔ Comentado para evitar conflicto con transpilePackages
    // serverComponentsExternalPackages: ['@mui/material'],
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });
    return config;
  },
};

module.exports = nextConfig;
