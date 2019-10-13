const { resolve } = require("path");
require("dotenv").config({ path: resolve(__dirname, "../../.env") });

module.exports = {
  mode: process.env.NODE_ENV,
  host: process.env.HOST,
  port: process.env.PORT,
  corsOrigin: process.env.CORS_ORIGIN,
  logsPathDev: resolve(process.cwd(), "./logs/"),
  apiKey: process.env.API_KEY,
  redisHost: process.env.REDIS_HOST,
  redisPort: process.env.REDIS_PORT,
  redisIndex: process.env.REDIS_DATABASE,
  redisPassword: process.env.REDIS_PASSWORD
};

// TODO: remove logsPathDev
