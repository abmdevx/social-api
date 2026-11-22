import "dotenv/config";
import { parseEnv, type Env } from "./env.schema.js";

export { EnvError, type Env } from "./env.schema.js";

/** Validated, typed configuration. Importing this module fails fast when the environment is invalid. */
export const env: Env = parseEnv(process.env);
