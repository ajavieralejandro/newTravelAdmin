// next.config.js
const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    esmExternals: 'loose',
  },
  eslint: {
    ignoreDuringBuilds: true,   // opcional
  },
  typescript: {
    ignoreBuildErrors: true,    // opcional; quitá esto cuando estabilice
  },
  webpack: (config) => {
    // Alias @ -> src
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@': path.resolve(__dirname, 'src'),
    };
    // (estas extensiones normalmente ya están, pero no molesta)
    if (!config.resolve.extensions.includes('.ts'))  config.resolve.extensions.push('.ts');
    if (!config.resolve.extensions.includes('.tsx')) config.resolve.extensions.push('.tsx');
    return config;
  },
};

module.exports = nextConfig;
