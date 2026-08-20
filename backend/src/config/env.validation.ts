import { plainToInstance } from 'class-transformer';
import { IsIn, IsNotEmpty, IsNumberString, IsOptional, IsString, validateSync } from 'class-validator';

/**
 * Fail-fast validation of required environment variables at boot.
 * Missing DATABASE_URL (etc.) crashes the app immediately with a clear message
 * rather than failing later at query time.
 */
class EnvVars {
  @IsOptional()
  @IsIn(['development', 'test', 'production'])
  NODE_ENV?: string;

  @IsOptional()
  @IsNumberString()
  PORT?: string;

  @IsString()
  @IsNotEmpty()
  DATABASE_URL!: string;

  @IsOptional()
  @IsString()
  JWT_ACCESS_SECRET?: string;

  @IsOptional()
  @IsString()
  JWT_REFRESH_SECRET?: string;
}

export function validateEnv(config: Record<string, unknown>) {
  const validated = plainToInstance(EnvVars, config, { enableImplicitConversion: true });
  const errors = validateSync(validated, { skipMissingProperties: false });
  if (errors.length > 0) {
    throw new Error(`Invalid environment configuration:\n${errors.toString()}`);
  }
  return config;
}
