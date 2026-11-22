export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 100 * 1024 * 1024;

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unit]}`;
}

/** Returns a human readable problem with an image file, or null when it is acceptable. */
export function validateImage(file: File): string | null {
  if (!file.type.startsWith("image/")) return "Please choose an image file.";
  if (file.size > MAX_IMAGE_BYTES)
    return `Images must be smaller than ${formatBytes(MAX_IMAGE_BYTES)}.`;
  return null;
}

export function validateVideo(file: File): string | null {
  if (!file.type.startsWith("video/")) return "Please choose a video file.";
  if (file.size > MAX_VIDEO_BYTES)
    return `Videos must be smaller than ${formatBytes(MAX_VIDEO_BYTES)}.`;
  return null;
}
