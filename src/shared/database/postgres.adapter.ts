import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool, PoolClient, PoolConfig } from 'pg';
import { DatabaseConfig } from '../config/database.config';
import { DatabasePort } from './database.port';

@Injectable()
export class PostgresAdapter implements DatabasePort, OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PostgresAdapter.name);
  private pool!: Pool;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    const cfg = this.configService.getOrThrow<DatabaseConfig>('database');

    const poolConfig: PoolConfig = {
      host: cfg.host,
      port: cfg.port,
      user: cfg.user,
      password: cfg.password,
      database: cfg.database,
      max: cfg.poolMax,
      idleTimeoutMillis: cfg.idleTimeoutMs,
      statement_timeout: cfg.statementTimeoutMs,
      ssl: cfg.ssl ? { rejectUnauthorized: false } : undefined,
      application_name: 'territoriales-backend',
    };

    this.pool = new Pool(poolConfig);

    this.pool.on('connect', (client: PoolClient) => {
      void client.query(`SET search_path TO ${this.escapeIdent(cfg.schema)}, public`);
    });

    this.pool.on('error', (err) => {
      this.logger.error(`Error inesperado del pool de Postgres: ${err.message}`, err.stack);
    });

    await this.assertConnection(cfg);
  }

  private escapeIdent(ident: string): string {
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(ident)) {
      throw new Error(`Identificador de schema inválido: ${ident}`);
    }
    return ident;
  }

  async onModuleDestroy(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.logger.log('Pool de Postgres cerrado');
    }
  }

  async query<T = unknown>(sql: string, params: ReadonlyArray<unknown> = []): Promise<T[]> {
    const start = Date.now();
    try {
      const result = await this.pool.query(sql, params as unknown[]);
      const duration = Date.now() - start;
      if (duration > 1000) {
        this.logger.warn(`Query lenta (${duration}ms): ${this.truncate(sql)}`);
      }
      return result.rows as T[];
    } catch (err) {
      const error = err as Error;
      this.logger.error(`Error ejecutando query: ${error.message} | SQL: ${this.truncate(sql)}`);
      throw error;
    }
  }

  async queryOne<T = unknown>(sql: string, params: ReadonlyArray<unknown> = []): Promise<T | null> {
    const rows = await this.query<T>(sql, params);
    return rows[0] ?? null;
  }

  private async assertConnection(cfg: DatabaseConfig): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('SELECT 1');
      this.logger.log(
        `Conectado a Postgres ${cfg.host}:${cfg.port}/${cfg.database} (schema: ${cfg.schema})`,
      );
    } finally {
      client.release();
    }
  }

  private truncate(sql: string): string {
    const oneLine = sql.replace(/\s+/g, ' ').trim();
    return oneLine.length > 200 ? `${oneLine.slice(0, 200)}…` : oneLine;
  }
}
