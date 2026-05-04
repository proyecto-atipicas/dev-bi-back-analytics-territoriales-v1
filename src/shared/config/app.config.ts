import { registerAs } from '@nestjs/config';

export interface AppConfig {
  nodeEnv: string;
  port: number;
  apiPrefix: string;
  corsOrigin: string;
  cacheTtlSeconds: number;
}

export const appConfig = registerAs<AppConfig>('app', () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '3001', 10),
  apiPrefix: process.env.API_PREFIX ?? 'api/v1',
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
  cacheTtlSeconds: parseInt(process.env.CACHE_TTL_SECONDS ?? '600', 10),
}));
