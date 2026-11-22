import { readFileSync } from "node:fs";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import { parse } from "yaml";
import { env } from "./config/env.js";
import { API_PREFIX } from "./constants.js";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware.js";
import { requireTrustedOrigin } from "./middlewares/originCheck.middleware.js";
import { apiLimiter } from "./middlewares/rateLimit.middleware.js";
import { requestLogger } from "./middlewares/requestLogger.middleware.js";
import healthcheckRouter from "./routes/healthcheck.routes.js";
import { createApiRouter } from "./routes/index.js";

/** Builds the Express application. Kept free of side effects (no listen, no DB) so it can be tested. */
export function createApp(): Express {
  const app = express();

  app.set("trust proxy", env.TRUST_PROXY);
  app.use(requestLogger);

  // Swagger UI needs inline scripts, which helmet's default CSP forbids, so it is mounted first.
  if (env.enableApiDocs) {
    const spec = parse(readFileSync(new URL("../openapi.yaml", import.meta.url), "utf8")) as Record<
      string,
      unknown
    >;
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(spec));
  }

  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
  app.use(express.json({ limit: "16kb" }));
  app.use(express.urlencoded({ extended: true, limit: "16kb" }));
  app.use(cookieParser());

  // Health probes bypass rate limiting and the origin check so monitoring never gets blocked.
  app.use(`${API_PREFIX}/healthcheck`, healthcheckRouter);

  app.use(API_PREFIX, apiLimiter, requireTrustedOrigin(env.CORS_ORIGIN), createApiRouter());

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
