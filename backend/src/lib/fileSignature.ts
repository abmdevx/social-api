export type DetectedKind = "image" | "video";

const startsWith = (bytes: Uint8Array, signature: number[], offset = 0): boolean =>
  signature.every((byte, index) => bytes[offset + index] === byte);

const ascii = (bytes: Uint8Array, start: number, end: number): string =>
  String.fromCharCode(...bytes.slice(start, end));

/**
 * Inspects the first bytes of a file ("magic numbers") and reports whether it is really an
 * image or a video. A client-supplied Content-Type or file extension is trivially forged;
 * this check is not.
 */
export function detectMediaKind(header: Uint8Array): DetectedKind | null {
  if (header.length < 12) return null;

  if (startsWith(header, [0xff, 0xd8, 0xff])) return "image"; // JPEG
  if (startsWith(header, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "image"; // PNG
  if (ascii(header, 0, 4) === "GIF8") return "image"; // GIF
  if (ascii(header, 0, 4) === "RIFF" && ascii(header, 8, 12) === "WEBP") return "image"; // WebP

  if (ascii(header, 4, 8) === "ftyp") {
    const brand = ascii(header, 8, 12);
    if (brand === "avif" || brand === "avis") return "image"; // AVIF
    return "video"; // MP4 / MOV / M4V and other ISO base media
  }
  if (startsWith(header, [0x1a, 0x45, 0xdf, 0xa3])) return "video"; // WebM / Matroska
  return null;
}
