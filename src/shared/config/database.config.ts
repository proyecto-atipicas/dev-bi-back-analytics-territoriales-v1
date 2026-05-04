import { registerAs } from '@nestjs/config';

export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  schema: string;
  poolMax: number;
  idleTimeoutMs: number;
  statementTimeoutMs: number;
  ssl: boolean;
}

export const databaseConfig = registerAs<DatabaseConfig>('database', () => ({
  host: process.env.DB_HOST!,
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_NAME!,
  schema: process.env.DB_SCHEMA ?? 'public',
  poolMax: parseInt(process.env.DB_POOL_MAX ?? '10', 10),
  idleTimeoutMs: parseInt(process.env.DB_POOL_IDLE_TIMEOUT_MS ?? '30000', 10),
  statementTimeoutMs: parseInt(process.env.DB_STATEMENT_TIMEOUT_MS ?? '15000', 10),
  ssl: (process.env.DB_SSL ?? 'false').toLowerCase() === 'true',
}));
