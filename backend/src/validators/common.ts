import { z } from "zod";
import { isObjectIdString } from "../lib/objectId.js";

export const objectId = z.string().refine(isObjectIdString, { message: "must be a valid id" });

export const pageQuery = z.object({
  page: z.coerce.number().int().min(1).max(10_000).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

/** Trimmed, non-empty text with a maximum length. */
export const text = (max: number) =>
  z.string().trim().min(1, "is required").max(max, `must be at most ${max} characters`);

/** Optional text; an empty string counts as "not provided". */
export const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `must be at most ${max} characters`)
    .optional()
    .transform((value) => (value === "" ? undefined : value));
