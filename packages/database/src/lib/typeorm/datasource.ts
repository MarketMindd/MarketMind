import 'reflect-metadata';
import 'pg';
import { DataSource } from 'typeorm';
import { createTypeOrmOptions } from './datasource-options.js';

export const AppDataSource = new DataSource(createTypeOrmOptions());
