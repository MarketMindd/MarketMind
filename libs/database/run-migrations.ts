import 'reflect-metadata';
import { AppDataSource } from './src/datasource/datasource.js';

async function main() {
  await AppDataSource.initialize();
  const migrations = await AppDataSource.runMigrations({ transaction: 'all' });
  console.log(`Ran ${migrations.length} migrations:`, migrations.map((m) => m.name));
  await AppDataSource.destroy();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
