module.exports = {
  apps: [
    {
      name: 'realproxynextjs-staging',
      script: 'node',
      args: '.next/standalone/server.js',
      cwd: '/var/www/realproxynextjs-staging',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 3003,
        HOST: '127.0.0.1',
        HOSTNAME: '127.0.0.1',
        API_URL_INTERNAL: 'http://127.0.0.1:5002',
      },
    },
  ],
};
