module.exports = {
  apps: [
    {
      name: 'realproxynextjs',
      script: 'node',
      args: '.next/standalone/server.js',
      cwd: '/var/www/realproxynextjs',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 3002,
      },
    },
  ],
};
