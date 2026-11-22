/* eslint-disable no-console -- this module is the single place allowed to write to the console */
type Level = "debug" | "info" | "warn" | "error";
type Threshold = Level | "silent";

const ORDER: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 };
const SENSITIVE_KEY = /pass(word)?|token|secret|authorization|cookie|api[_-]?key/i;

let threshold: Threshold = "info";
let pretty = false;

export function configureLogger(options: { level: Threshold; pretty: boolean }): void {
  threshold = options.level;
  pretty = options.pretty;
}

/** Recursively masks values whose key looks sensitive. Depth-limited to stay cheap and cycle-safe. */
export function redact(value: unknown, depth = 0): unknown {
  if (depth > 4 || value === null || typeof value !== "object") return value;
  if (value instanceof Error) return serializeError(value);
  if (Array.isArray(value)) return value.map((item) => redact(item, depth + 1));
  const output: Record<string, unknown> = {};
  for (const [key, inner] of Object.entries(value)) {
    output[key] = SENSITIVE_KEY.test(key) ? "[REDACTED]" : redact(inner, depth + 1);
  }
  return output;
}

function serializeError(error: Error): Record<string, unknown> {
  return { name: error.name, message: error.message, stack: error.stack };
}

function write(level: Level, message: string, meta?: Record<string, unknown>): void {
  if (threshold === "silent" || ORDER[level] < ORDER[threshold]) return;
  const safeMeta = meta ? (redact(meta) as Record<string, unknown>) : undefined;
  const sink = level === "error" ? console.error : level === "warn" ? console.warn : console.log;

  if (pretty) {
    const suffix = safeMeta && Object.keys(safeMeta).length ? ` ${JSON.stringify(safeMeta)}` : "";
    sink(`${new Date().toISOString()} ${level.toUpperCase().padEnd(5)} ${message}${suffix}`);
    return;
  }
  sink(JSON.stringify({ time: new Date().toISOString(), level, message, ...safeMeta }));
}

export const logger = {
  debug: (message: string, meta?: Record<string, unknown>) => write("debug", message, meta),
  info: (message: string, meta?: Record<string, unknown>) => write("info", message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => write("warn", message, meta),
  error: (message: string, meta?: Record<string, unknown>) => write("error", message, meta),
};
