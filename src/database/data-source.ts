import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { entities } from '../entities';
config();
export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL ?? 'postgres://postgres:postgres@localhost:5432/task_management',
  entities,
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false
});
export default AppDataSource;
