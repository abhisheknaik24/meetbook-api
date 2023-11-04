module.exports = {
  apps: [
    {
      name: "meetbook-api",
      script: "dist/index.js",
      watch: true,
      env: {
        NODE_ENV: "production",
      },
      instances: 1,
      exec_mode: "cluster",
    },
  ],
};
