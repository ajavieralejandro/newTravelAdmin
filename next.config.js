// next.config.js
const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // si ya tenés "experimental", mantenelo
  experimental: {
    esmExternals: 'loose',
  },
  webpack: (config) => {
    // Alias @ -> src
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@': path.resolve(__dirname, 'src'),
    };
    // Asegura extensiones TS/TSX
    if (!config.resolve.extensions.includes('.ts')) config.resolve.extensions.push('.ts');
    if (!config.resolve.extensions.includes('.tsx')) config.resolve.extensions.push('.tsx');
    return config;
  },
};

module.exports = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true }, // opcional (ojo, omite errores TS)
};