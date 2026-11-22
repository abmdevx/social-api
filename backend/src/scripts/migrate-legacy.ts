/**
 * One-off migration for databases created by the pre-TypeScript version of Streamline.
 *
 *  - Removes the raw `refreshToken` field from users. The old code stored refresh tokens in
 *    plain text; the new code only stores a SHA-256 hash in `refreshTokenHash`.
 *  - Builds every index declared by the current models (without dropping anything).
 *
 * Existing sessions stop working (the token format changed), so users simply sign in again.
 * Usage: npm run db:migrate-legacy
 */
import mongoose from "mongoose";
import { connectDatabase, disconnectDatabase } from "../db/connection.js";
import { logger } from "../lib/logger.js";
import "../models/comment.model.js";
import "../models/like.model.js";
import "../models/playlist.model.js";
import "../models/subscription.model.js";
import "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import "../models/video.model.js";

await connectDatabase();
try {
  const result = await User.collection.updateMany(
    { refreshToken: { $exists: true } },
    { $unset: { refreshToken: "" } }
  );
  logger.info("Removed legacy plain-text refresh tokens", { modified: result.modifiedCount });

  for (const modelName of mongoose.modelNames()) {
    await mongoose.model(modelName).createIndexes();
    logger.info("Indexes ensured", { model: modelName });
  }
} finally {
  await disconnectDatabase();
}
