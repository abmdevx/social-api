import type { AuthUser } from "../models/user.model.js";

declare global {
  namespace Express {
    interface Request {
      /** Set by `requireAuth`. Use `getAuthUser(req)` in handlers for a non-optional type. */
      user?: AuthUser;
    }
  }
}

export {};
