import 'dotenv/config';
import 'reflect-metadata';
import 'pg';
import { DataSource } from 'typeorm';
import { createDataSourceOptions } from './datasource.options.js';

export const AppDataSource = new DataSource(createDataSourceOptions());
