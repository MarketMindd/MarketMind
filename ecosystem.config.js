module.exports = {
  apps: [
    {
      name: 'marketmind',
      script: './dist/main.js',
      instances: 1, // You can change this to 'max' to run in cluster mode across all CPU cores
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env_file: '.env',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
