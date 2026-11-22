import { randomUUID } from "node:crypto";
import fs from "node:fs";
import type { Request, RequestHandler } from "express";
import multer, { type FileFilterCallback } from "multer";
import { env } from "../config/env.js";
import { ApiError } from "../lib/apiError.js";
import { detectMediaKind, type DetectedKind } from "../lib/fileSignature.js";

const IMAGE_FIELDS = new Set(["avatar", "coverImage", "thumbnail"]);
const VIDEO_FIELDS = new Set(["video"]);

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/avif": ".avif",
  "video/mp4": ".mp4",
  "video/webm": ".webm",
  "video/quicktime": ".mov",
  "video/x-matroska": ".mkv",
};

export function ensureUploadDir(): void {
  fs.mkdirSync(env.UPLOAD_TMP_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, env.UPLOAD_TMP_DIR),
  // Never trust the client-supplied filename: it can contain path separators or odd extensions.
  filename: (_req, file, cb) => cb(null, `${randomUUID()}${EXTENSIONS[file.mimetype] ?? ""}`),
});

function expectedKind(field: string): DetectedKind | null {
  if (IMAGE_FIELDS.has(field)) return "image";
  if (VIDEO_FIELDS.has(field)) return "video";
  return null;
}

const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback): void => {
  const kind = expectedKind(file.fieldname);
  const declared = file.mimetype.split("/")[0];
  if (!kind) {
    cb(new ApiError(400, `Unexpected file field "${file.fieldname}"`));
  } else if (declared !== kind || !(file.mimetype in EXTENSIONS)) {
    cb(new ApiError(415, `"${file.fieldname}" must be a supported ${kind} file`));
  } else {
    cb(null, true);
  }
};

const limits = { files: 2, fields: 10, fieldSize: 64 * 1024 };
const imageUploader = multer({
  storage,
  fileFilter,
  limits: { ...limits, fileSize: env.maxImageBytes },
});
const mediaUploader = multer({
  storage,
  fileFilter,
  limits: { ...limits, fileSize: env.maxVideoBytes },
});

/** Every uploaded file of a request, whichever multer mode produced it. */
export function collectFiles(req: Request): Express.Multer.File[] {
  const { file, files } = req;
  if (Array.isArray(files)) return files;
  if (files) return Object.values(files).flat();
  return file ? [file] : [];
}

export function getUploadedFile(req: Request, field: string): Express.Multer.File | undefined {
  if (req.file?.fieldname === field) return req.file;
  if (req.files && !Array.isArray(req.files)) return req.files[field]?.[0];
  return undefined;
}

/** Removes any temp file still on disk once the response is done, whatever the outcome. */
const cleanupTempFiles: RequestHandler = (req, res, next) => {
  res.once("close", () => {
    for (const file of collectFiles(req)) {
      fs.promises.rm(file.path, { force: true }).catch(() => undefined);
    }
  });
  next();
};

async function readHeader(filePath: string): Promise<Uint8Array> {
  const handle = await fs.promises.open(filePath, "r");
  try {
    const buffer = Buffer.alloc(16);
    const { bytesRead } = await handle.read(buffer, 0, buffer.length, 0);
    return buffer.subarray(0, bytesRead);
  } finally {
    await handle.close();
  }
}

/** Confirms each file's real content (magic bytes) matches what its field promises. */
const verifyFileContents: RequestHandler = async (req, _res, next) => {
  for (const file of collectFiles(req)) {
    const expected = expectedKind(file.fieldname);
    const actual = detectMediaKind(await readHeader(file.path));
    if (!expected || actual !== expected) {
      throw new ApiError(415, `"${file.fieldname}" is not a valid ${expected ?? "media"} file`);
    }
    // Thumbnails travel with a (much larger) video upload, so their size is checked here.
    if (expected === "image" && file.size > env.maxImageBytes) {
      throw new ApiError(413, `"${file.fieldname}" must be at most ${env.MAX_IMAGE_SIZE_MB} MB`);
    }
  }
  next();
};

const asHandlers = (...handlers: RequestHandler[]): RequestHandler[] => handlers;

/** One image under the given field name (avatar, cover image, thumbnail). */
export const uploadSingleImage = (field: string): RequestHandler[] =>
  asHandlers(cleanupTempFiles, imageUploader.single(field), verifyFileContents);

/** Registration: required avatar plus optional cover image. */
export const uploadRegistrationImages: RequestHandler[] = asHandlers(
  cleanupTempFiles,
  imageUploader.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  verifyFileContents
);

/** Video upload: one video plus an optional thumbnail. */
export const uploadVideoWithThumbnail: RequestHandler[] = asHandlers(
  cleanupTempFiles,
  mediaUploader.fields([
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  verifyFileContents
);
