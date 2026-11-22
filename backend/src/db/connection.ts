import mongoose from "mongoose";
import { env } from "../config/env.js";
import { logger } from "../lib/logger.js";

export async function connectDatabase(): Promise<void> {
  mongoose.connection.on("error", (error: unknown) =>
    logger.error("MongoDB connection error", { error })
  );
  mongoose.connection.on("disconnected", () => logger.warn("MongoDB disconnected"));
  mongoose.connection.on("reconnected", () => logger.info("MongoDB reconnected"));

  await mongoose.connect(env.MONGO_URI, {
    dbName: env.DB_NAME,
    serverSelectionTimeoutMS: 10_000,
  });
  logger.info("MongoDB connected", {
    host: mongoose.connection.host,
    database: mongoose.connection.name,
  });
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}
