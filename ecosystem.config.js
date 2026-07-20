module.exports = {
  apps: [{
    name: 'llm-api-gateway',
    script: 'server.js',
    instances: 'max', // Scale across all available CPU cores
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
