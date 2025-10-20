import { getSiteURL } from '@/lib/get-site-url';
import { LogLevel } from '@/lib/logger';

const DEFAULT_LOG_LEVEL = LogLevel.ALL;
export const config = {
  site: {
    name: 'Devias Kit',
    description: '',
    themeColor: '#090a0b',
    url: getSiteURL(),
  },
  logLevel: process.env.NEXT_PUBLIC_LOG_LEVEL && LogLevel[process.env.NEXT_PUBLIC_LOG_LEVEL as keyof typeof LogLevel]
    ? LogLevel[process.env.NEXT_PUBLIC_LOG_LEVEL as keyof typeof LogLevel]
    : DEFAULT_LOG_LEVEL,
};

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.startsWith('http')
    ? process.env.NEXT_PUBLIC_API_URL
    : 'http://localhost:3000/api';

