import 'reflect-metadata';
import 'pg';

import { DataSource } from 'typeorm';

import { createDataSourceOptions } from './datasource.options';

export const AppDataSource = new DataSource(createDataSourceOptions());
