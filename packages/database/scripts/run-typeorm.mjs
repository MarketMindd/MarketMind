import { spawn } from 'node:child_process';

const [command] = process.argv.slice(2);

if (!command) {
  console.error('Missing TypeORM command.');
  process.exit(1);
}

const args = ['-d', './src/lib/typeorm/datasource.ts', command];

if (command === 'migration:generate') {
  const migrationName = process.env.npm_config_name;

  if (!migrationName) {
    console.error(
      'Missing migration name. Use: npm run db:migration:generate --name=your_migration_name',
    );
    process.exit(1);
  }

  args.push(`./src/lib/typeorm/migrations/${migrationName}`);
}

const childProcess = spawn('typeorm-ts-node-esm', args, {
  stdio: 'inherit',
  shell: true,
});

childProcess.on('exit', (code) => {
  process.exit(code ?? 1);
});
