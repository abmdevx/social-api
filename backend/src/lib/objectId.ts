const OBJECT_ID_PATTERN = /^[a-f\d]{24}$/i;

/**
 * Strict 24-hex-char check. Unlike mongoose's `isValidObjectId`, this does not accept
 * arbitrary 12-character strings, which would otherwise be cast to an unrelated ObjectId.
 */
export function isObjectIdString(value: unknown): value is string {
  return typeof value === "string" && OBJECT_ID_PATTERN.test(value);
}
