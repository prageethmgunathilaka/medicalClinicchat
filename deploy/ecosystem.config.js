module.exports = {
  apps: [
    {
      name: 'medical-clinic-chat-backend',
      script: 'dist/index.js',
      cwd: './backend',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
        OPENAI_API_KEY: process.env.OPENAI_API_KEY
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true
    }
  ]
}; 