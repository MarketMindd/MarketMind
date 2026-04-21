import { parseBoolean, parseNumber } from '../utils/parse.utils.js';

export interface DatabaseEnvironment {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  ssl: boolean;
}

const getDefaultUsername = (env: NodeJS.ProcessEnv): string =>
  env.PGUSER ?? env.USER ?? env.LOGNAME ?? 'postgres';

const getDefaultDatabase = (env: NodeJS.ProcessEnv): string =>
  env.PGDATABASE ?? env.DB_NAME ?? getDefaultUsername(env);

const parseDatabaseUrl = (
  databaseUrl: string,
  env: NodeJS.ProcessEnv,
): DatabaseEnvironment => {
  const url = new URL(databaseUrl);

  return {
    host: url.hostname || env.DB_HOST || env.PGHOST || 'localhost',
    port: url.port ? Number(url.port) : parseNumber(env.DB_PORT ?? env.PGPORT, 5432),
    username:
      decodeURIComponent(url.username) ||
      env.DB_USER ||
      env.PGUSER ||
      getDefaultUsername(env),
    password: decodeURIComponent(url.password || env.DB_PASSWORD || env.PGPASSWORD || ''),
    database: url.pathname.replace(/^\//, '') || getDefaultDatabase(env),
    ssl:
      url.searchParams.get('sslmode') === 'require' ||
      parseBoolean(env.DB_SSL, false),
  };
};

export const getDatabaseConfig = (
  env: NodeJS.ProcessEnv = process.env,
): DatabaseEnvironment => {
  if (env.DATABASE_URL) {
    return parseDatabaseUrl(env.DATABASE_URL, env);
  }

  return {
    host: env.DB_HOST ?? env.PGHOST ?? 'localhost',
    port: parseNumber(env.DB_PORT ?? env.PGPORT, 5432),
    username: env.DB_USER ?? env.PGUSER ?? getDefaultUsername(env),
    password: env.DB_PASSWORD ?? env.PGPASSWORD ?? '',
    database: getDefaultDatabase(env),
    ssl: parseBoolean(env.DB_SSL ?? env.PGSSLMODE, false),
  };
};
