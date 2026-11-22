import { EnvError } from "./config/env.schema.js";

// The server is loaded dynamically so that an invalid environment is reported as a readable
// list of problems instead of a stack trace from deep inside an import.
try {
  await import("./server.js");
} catch (error) {
  if (error instanceof EnvError) {
    process.stderr.write(`${error.message}\n`);
    process.exit(1);
  }
  throw error;
}
