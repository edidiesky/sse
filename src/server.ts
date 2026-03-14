import dotenv from "dotenv";
dotenv.config();

import { app } from "./app";
import logger from "./utils/logger";

const PORT = process.env["PORT"] ?? 3000;

/**
 * Keep a referenc
 */
const server = app.listen(PORT, () => {
  logger.info(`[server] Running on port ${PORT}`);
});

const gracefulShutdown = (signal: string): void => {
  logger.info(`[server] ${signal} received - shutting down`);

  server.close((err) => {
    if (err) {
      logger.error("[server] Error during shutdown", err);
      process.exit(1);
    }
    logger.info("[server] All connections closed");
    process.exit(0);
  });
};

process.on("unhandledRejection", (reason) => {
  logger.error("[server] Unhandled rejection", reason);
  gracefulShutdown("unhandledRejection");
});

process.on("uncaughtException", (error) => {
  logger.error("[server] Uncaught exception", error);
  gracefulShutdown("uncaughtException");
});

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
