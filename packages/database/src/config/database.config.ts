import { parseBoolean, parseNumber } from '../utils/parse.utils.js';

export interface DatabaseEnvironment {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  ssl: boolean;
}

export const getDatabaseConfig = (
  env: NodeJS.ProcessEnv = process.env,
): DatabaseEnvironment => ({
  host: env.DB_HOST ?? 'localhost',
  port: parseNumber(env.DB_PORT, 5432),
  username: env.DB_USER ?? 'postgres',
  password: env.DB_PASSWORD ?? 'postgres',
  database: env.DB_NAME ?? 'marketmind',
  ssl: parseBoolean(env.DB_SSL, false),
});
