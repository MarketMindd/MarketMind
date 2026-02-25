import { config } from 'dotenv';
import { DataSourceOptions } from 'typeorm';
import { PortfolioHoldingEntity } from '../entities/portfolio-holding.entity.js';
import { PortfolioEntity } from '../entities/portfolio.entity.js';
import { UserProfileEntity } from '../entities/user-profile.entity.js';
import { InitialSchema1739000000000 } from './migrations/1739000000000-initial-schema.js';
import { PortfolioSchema1739200000000 } from './migrations/1739200000000-portfolio-schema.js';

config();

export interface DatabaseEnvironment {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  ssl: boolean;
}

const parseBoolean = (value: string | undefined, defaultValue: boolean): boolean => {
  if (value === undefined) {
    return defaultValue;
  }

  return value.toLowerCase() === 'true';
};

const parseNumber = (value: string | undefined, defaultValue: number): number => {
  const parsed = Number(value);

  if (Number.isNaN(parsed)) {
    return defaultValue;
  }

  return parsed;
};

export const getDatabaseEnvironment = (
  env: NodeJS.ProcessEnv = process.env,
): DatabaseEnvironment => ({
  host: env.DB_HOST ?? 'localhost',
  port: parseNumber(env.DB_PORT, 5432),
  username: env.DB_USER ?? 'postgres',
  password: env.DB_PASSWORD ?? 'postgres',
  database: env.DB_NAME ?? 'marketmind',
  ssl: parseBoolean(env.DB_SSL, false),
});

export const createTypeOrmOptions = (): DataSourceOptions => {
  const dbEnv = getDatabaseEnvironment();

  return {
    type: 'postgres',
    host: dbEnv.host,
    port: dbEnv.port,
    username: dbEnv.username,
    password: dbEnv.password,
    database: dbEnv.database,
    ssl: dbEnv.ssl ? { rejectUnauthorized: false } : false,
    synchronize: false,
    logging: false,
    entities: [UserProfileEntity, PortfolioEntity, PortfolioHoldingEntity],
    migrations: [InitialSchema1739000000000, PortfolioSchema1739200000000],
    migrationsTableName: 'typeorm_migrations',
  };
};
