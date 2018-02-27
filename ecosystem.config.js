module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps : [
    {
      name      : 'wedding',
      script    : 'server.js',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      env_production : {
        NODE_ENV: 'production',
        PORT: 8000
      }
    }
  ]
};
