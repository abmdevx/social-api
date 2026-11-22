import { v2 as cloudinary } from "cloudinary";
import { env } from "../config/env.js";
import { ApiError } from "../lib/apiError.js";
import { logger } from "../lib/logger.js";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

export type ResourceType = "image" | "video";

export interface UploadedAsset {
  url: string;
  publicId: string;
  /** Seconds. Only present for video. */
  duration?: number;
}

export interface UploadJob {
  path: string;
  resourceType: ResourceType;
  folder: string;
}

export interface StoredAsset {
  publicId?: string | undefined;
  resourceType: ResourceType;
}

async function uploadOne(job: UploadJob): Promise<UploadedAsset> {
  const options = { resource_type: job.resourceType, folder: `streamline/${job.folder}` };
  // Chunked upload handles large videos without holding the whole file in memory.
  const response =
    job.resourceType === "video"
      ? await cloudinary.uploader.upload_large(job.path, { ...options, chunk_size: 6_000_000 })
      : await cloudinary.uploader.upload(job.path, options);

  const asset: UploadedAsset = { url: response.secure_url, publicId: response.public_id };
  if (typeof response.duration === "number") asset.duration = response.duration;
  return asset;
}

/** Deletes assets, logging (never throwing) on failure. Use for cleanup and rollbacks. */
export async function deleteAssetsQuietly(assets: StoredAsset[]): Promise<void> {
  const targets = assets.filter((asset): asset is StoredAsset & { publicId: string } =>
    Boolean(asset.publicId)
  );
  const results = await Promise.allSettled(
    targets.map((asset) =>
      cloudinary.uploader.destroy(asset.publicId, { resource_type: asset.resourceType })
    )
  );
  results.forEach((result, index) => {
    if (result.status === "rejected") {
      logger.warn("Cloudinary asset could not be deleted", {
        publicId: targets[index]?.publicId,
        error: result.reason,
      });
    }
  });
}

/**
 * Uploads every job or none: if one fails, the ones that already succeeded are removed again
 * so no orphaned media is left behind.
 */
export async function uploadAllOrNone(jobs: UploadJob[]): Promise<UploadedAsset[]> {
  const results = await Promise.allSettled(jobs.map(uploadOne));

  const assets: UploadedAsset[] = [];
  const succeeded: StoredAsset[] = [];
  let failure: unknown;

  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      assets.push(result.value);
      succeeded.push({
        publicId: result.value.publicId,
        resourceType: jobs[index]?.resourceType ?? "image",
      });
    } else {
      failure ??= result.reason;
    }
  });

  if (failure !== undefined) {
    await deleteAssetsQuietly(succeeded);
    logger.error("Cloudinary upload failed", { error: failure });
    throw new ApiError(502, "Media upload failed. Please try again.");
  }
  return assets;
}

export async function uploadToCloudinary(job: UploadJob): Promise<UploadedAsset> {
  const [asset] = await uploadAllOrNone([job]);
  if (!asset) throw new ApiError(502, "Media upload failed. Please try again.");
  return asset;
}
