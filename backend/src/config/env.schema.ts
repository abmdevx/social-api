import os from "node:os";
import path from "node:path";
import { z } from "zod";

const duration = z
  .string()
  .regex(/^\d+[smhd]$/, 'must be a number followed by s, m, h or d, e.g. "15m" or "7d"');

const booleanString = z.enum(["true", "false"]).transform((value) => value === "true");

const secret = z
  .string()
  .min(
    32,
    "must be at least 32 characters. Generate one with: node -e \"console.log(require('crypto').randomBytes(48).toString('hex'))\""
  );

/** Empty strings (e.g. `KEY=` in a .env file) are treated as "not set". */
const emptyToUndefined = (value: unknown): unknown => (value === "" ? undefined : value);

export const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().int().min(1).max(65535).default(8000),
    TRUST_PROXY: z.coerce.number().int().min(0).default(0),
    LOG_LEVEL: z.enum(["debug", "info", "warn", "error", "silent"]).default("info"),

    MONGO_URI: z.string().min(1, "is required"),
    DB_NAME: z.string().min(1).default("streamline"),

    CORS_ORIGIN: z
      .string()
      .default("http://localhost:5173")
      .transform((value) =>
        value
          .split(",")
          .map((origin) => origin.trim().replace(/\/$/, ""))
          .filter(Boolean)
      )
      .refine((origins) => origins.length > 0, "must contain at least one origin"),
    COOKIE_SAMESITE: z.enum(["lax", "strict", "none"]).default("lax"),
    COOKIE_DOMAIN: z.preprocess(emptyToUndefined, z.string().optional()),

    ACCESS_TOKEN_SECRET: secret,
    ACCESS_TOKEN_EXPIRY: duration.default("15m"),
    REFRESH_TOKEN_SECRET: secret,
    REFRESH_TOKEN_EXPIRY: duration.default("7d"),

    CLOUDINARY_CLOUD_NAME: z.string().min(1, "is required"),
    CLOUDINARY_API_KEY: z.string().min(1, "is required"),
    CLOUDINARY_API_SECRET: z.string().min(1, "is required"),

    MAX_IMAGE_SIZE_MB: z.coerce.number().positive().default(5),
    MAX_VIDEO_SIZE_MB: z.coerce.number().positive().default(100),
    UPLOAD_TMP_DIR: z.preprocess(
      emptyToUndefined,
      z.string().default(path.join(os.tmpdir(), "streamline-uploads"))
    ),

    RATE_LIMIT_ENABLED: z.preprocess(emptyToUndefined, booleanString.default("true")),
    RATE_LIMIT_WINDOW_MINUTES: z.coerce.number().positive().default(15),
    RATE_LIMIT_MAX: z.coerce.number().int().positive().default(600),
    AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(20),

    ENABLE_API_DOCS: z.preprocess(emptyToUndefined, booleanString.optional()),
  })
  .superRefine((value, ctx) => {
    if (value.ACCESS_TOKEN_SECRET === value.REFRESH_TOKEN_SECRET) {
      ctx.addIssue({
        code: "custom",
        path: ["REFRESH_TOKEN_SECRET"],
        message: "must differ from ACCESS_TOKEN_SECRET",
      });
    }
    if (value.COOKIE_SAMESITE === "none" && value.NODE_ENV !== "production") {
      ctx.addIssue({
        code: "custom",
        path: ["COOKIE_SAMESITE"],
        message: '"none" requires NODE_ENV=production because such cookies must be Secure',
      });
    }
  })
  .transform((value) => ({
    ...value,
    isProduction: value.NODE_ENV === "production",
    isTest: value.NODE_ENV === "test",
    enableApiDocs: value.ENABLE_API_DOCS ?? value.NODE_ENV !== "production",
    maxImageBytes: Math.floor(value.MAX_IMAGE_SIZE_MB * 1024 * 1024),
    maxVideoBytes: Math.floor(value.MAX_VIDEO_SIZE_MB * 1024 * 1024),
  }));

export type Env = z.output<typeof envSchema>;

export class EnvError extends Error {
  constructor(public readonly problems: string[]) {
    super(`Invalid environment configuration:\n${problems.map((p) => `  - ${p}`).join("\n")}`);
    this.name = "EnvError";
  }
}

/** Validates a raw environment object. Exported separately from `env` so it can be unit tested. */
export function parseEnv(source: Record<string, string | undefined>): Env {
  const result = envSchema.safeParse(source);
  if (!result.success) {
    throw new EnvError(
      result.error.issues.map((issue) => `${issue.path.join(".") || "env"}: ${issue.message}`)
    );
  }
  return result.data;
}
