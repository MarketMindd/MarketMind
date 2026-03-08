import { DataSourceOptions } from 'typeorm';
import { UserProfileEntity } from '../entities/user-profile.entity.js';
import { getDatabaseConfig } from '../config/database.config.js';

export const createDataSourceOptions = (): DataSourceOptions => {
  const dbEnv = getDatabaseConfig();

  return {
    type: 'postgres',
    host: dbEnv.host,
    port: dbEnv.port,
    username: dbEnv.username,
    password: dbEnv.password,
    database: dbEnv.database,
    ssl: dbEnv.ssl,
    synchronize: false,
    logging: false,
    entities: [UserProfileEntity],
    migrations: ['./src/migrations/*.ts'],
    migrationsTableName: 'migrations',
  };
};

