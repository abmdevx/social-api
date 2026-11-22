import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { connectDatabase, disconnectDatabase } from "./db/connection.js";
import { configureLogger, logger } from "./lib/logger.js";
import { ensureUploadDir } from "./middlewares/upload.middleware.js";

configureLogger({ level: env.LOG_LEVEL, pretty: !env.isProduction });

const SHUTDOWN_TIMEOUT_MS = 10_000;

async function main(): Promise<void> {
  ensureUploadDir();
  await connectDatabase();

  const server = createApp().listen(env.PORT, () => {
    logger.info("Server listening", { port: env.PORT, environment: env.NODE_ENV });
  });

  let shuttingDown = false;
  const shutdown = (reason: string, exitCode: number): void => {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.info("Shutting down", { reason });

    // Do not hang forever on keep-alive connections.
    setTimeout(() => process.exit(1), SHUTDOWN_TIMEOUT_MS).unref();
    server.close(() => {
      void disconnectDatabase()
        .catch((error: unknown) => logger.error("Error while closing MongoDB", { error }))
        .finally(() => process.exit(exitCode));
    });
    server.closeIdleConnections();
  };

  process.on("SIGTERM", () => shutdown("SIGTERM", 0));
  process.on("SIGINT", () => shutdown("SIGINT", 0));
  process.on("unhandledRejection", (reason) => {
    logger.error("Unhandled promise rejection", { error: reason });
    shutdown("unhandledRejection", 1);
  });
  process.on("uncaughtException", (error) => {
    logger.error("Uncaught exception", { error });
    shutdown("uncaughtException", 1);
  });
}

main().catch((error: unknown) => {
  logger.error("Failed to start the server", { error });
  process.exit(1);
});
