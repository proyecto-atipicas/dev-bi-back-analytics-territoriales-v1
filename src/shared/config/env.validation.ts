import { plainToInstance } from 'class-transformer';
import { IsBooleanString, IsOptional, IsString, validateSync } from 'class-validator';

export class EnvironmentVariables {
  @IsOptional()
  @IsString()
  NODE_ENV?: string;

  @IsOptional()
  @IsString()
  PORT?: string;

  @IsOptional()
  @IsString()
  API_PREFIX?: string;

  @IsOptional()
  @IsString()
  CORS_ORIGIN?: string;

  @IsString()
  DB_HOST!: string;

  @IsString()
  DB_PORT!: string;

  @IsString()
  DB_USER!: string;

  @IsString()
  DB_PASSWORD!: string;

  @IsString()
  DB_NAME!: string;

  @IsString()
  DB_SCHEMA!: string;

  @IsOptional()
  @IsString()
  DB_POOL_MAX?: string;

  @IsOptional()
  @IsString()
  DB_POOL_IDLE_TIMEOUT_MS?: string;

  @IsOptional()
  @IsString()
  DB_STATEMENT_TIMEOUT_MS?: string;

  @IsOptional()
  @IsBooleanString()
  DB_SSL?: string;

  @IsOptional()
  @IsString()
  CACHE_TTL_SECONDS?: string;
}

export function validateEnv(config: Record<string, unknown>): EnvironmentVariables {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: false,
  });
  const errors = validateSync(validated, { skipMissingProperties: false });
  if (errors.length > 0) {
    throw new Error(
      `Configuración de entorno inválida:\n${errors.map((e) => e.toString()).join('\n')}`,
    );
  }
  return validated;
}
