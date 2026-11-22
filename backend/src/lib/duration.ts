const UNIT_SECONDS = { s: 1, m: 60, h: 3600, d: 86400 } as const;

/** Parses "15m", "1d", "30s" ... into whole seconds. Throws on anything else. */
export function durationToSeconds(value: string): number {
  const match = /^(\d+)([smhd])$/.exec(value.trim());
  if (!match) {
    throw new Error(
      `Invalid duration "${value}". Use a number followed by s, m, h or d (e.g. "15m").`
    );
  }
  const amount = Number(match[1]);
  const unit = match[2] as keyof typeof UNIT_SECONDS;
  return amount * UNIT_SECONDS[unit];
}
