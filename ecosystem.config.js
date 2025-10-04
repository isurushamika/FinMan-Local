// PM2 Ecosystem Configuration for Multi-App Server
// This file manages multiple applications on a single server

module.exports = {
  apps: [
    // FinMan Backend API
    {
      name: 'finman-api',
      script: './apps/finman/backend/dist/server.js',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: './logs/finman-api-error.log',
      out_file: './logs/finman-api-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
    },

    // Add more apps here as you create them
    // Example for a second app:
    /*
    {
      name: 'app2-api',
      script: './apps/app2/backend/dist/server.js',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development',
        PORT: 3001,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      error_file: './logs/app2-api-error.log',
      out_file: './logs/app2-api-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
    },
    */
  ],

  deploy: {
    production: {
      user: 'deployer',
      host: 'your-server.com',
      ref: 'origin/main',
      repo: 'git@github.com:yourusername/yourrepo.git',
      path: '/var/www/apps',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
    },
  },
};
