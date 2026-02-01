// PM2 Ecosystem Configuration for x402guard
// Runs both Express API server and Next.js web app

module.exports = {
  apps: [
    {
      name: "x402guard-api",
      cwd: "./server",
      script: "dist/index.js",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 3001,
      },
      // Restart on failure
      max_restarts: 10,
      restart_delay: 1000,
      // Logging (use ~/.pm2/logs by default, or create logs/ in project)
      error_file: "./logs/api-error.log",
      out_file: "./logs/api-out.log",
      merge_logs: true,
      // Health monitoring
      max_memory_restart: "500M",
    },
    {
      name: "x402guard-web",
      cwd: "./apps/web",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      interpreter: "node",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        // NEXT_PUBLIC_ prefix required for client-side access in Next.js
        NEXT_PUBLIC_API_URL: "http://localhost:3001",
      },
      // Wait for API to start first
      wait_ready: true,
      listen_timeout: 10000,
      // Restart on failure
      max_restarts: 10,
      restart_delay: 2000,
      // Logging (use ~/.pm2/logs by default, or create logs/ in project)
      error_file: "./logs/web-error.log",
      out_file: "./logs/web-out.log",
      merge_logs: true,
      // Health monitoring
      max_memory_restart: "1G",
    },
  ],
};
