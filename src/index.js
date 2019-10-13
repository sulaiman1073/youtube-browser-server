// eslint-disable-next-line import/order
const config = require("./config");
const { existsSync, mkdirSync } = require("fs");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const responseTime = require("response-time");

const requestId = require("./helpers/middleware/requestId");
const logger = require("./config/logger");
const errorHandler = require("./helpers/middleware/errorHandler");
const requestLogger = require("./helpers/middleware/requestLogger");

if (!existsSync(config.logsPathDev)) {
  mkdirSync(config.logsPathDev, { recursive: true });
}

const app = express();

app.use("/", express.static("./public"));

if (config.mode === "production") {
  app.set("trust proxy", "loopback");

  app.use(
    cors({
      origin(origin, cb) {
        const whitelist = config.corsOrigin ? config.corsOrigin.split(",") : [];

        if (!origin || whitelist.indexOf(origin) !== -1) {
          cb(null, true);
        } else {
          cb(new Error("Not allowed by CORS"));
        }
      },
      credentials: true
    })
  );
} else {
  app.use(cors());
}
app.use(responseTime());
app.use(requestId());

app.use(express.json());

app.use(cookieParser());

if (config.mode === "production") {
  app.use(helmet());
}

if (config.mode !== "testing") {
  app.use(requestLogger);
}

app.use("/api", require("./api/"));

app.use(errorHandler);

let server;
if (config.mode !== "testing") {
  server = app.listen(config.port || 4000, config.host || "localhost", () => {
    logger.info(
      `Server is running at ${server.address().address}:${
        server.address().port
      } in ${app.get("env")} mode`
    );
  });
}

module.exports = app;
