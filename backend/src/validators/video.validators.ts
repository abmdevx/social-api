import { z } from "zod";
import { objectId, optionalText, pageQuery, text } from "./common.js";

export const videoIdParams = z.object({ videoId: objectId });

export const listVideosQuery = pageQuery.extend({
  query: z
    .string()
    .trim()
    .max(100)
    .optional()
    .transform((value) => value || undefined),
  sortBy: z.enum(["createdAt", "views", "duration", "title"]).default("createdAt"),
  sortType: z.enum(["asc", "desc"]).default("desc"),
  userId: objectId.optional(),
});

export const uploadVideoBody = z.object({
  title: optionalText(100),
  description: optionalText(5000),
});

export const updateVideoBody = z
  .object({
    title: text(100).optional(),
    description: z.string().trim().max(5000).optional(),
  })
  .refine((value) => value.title !== undefined || value.description !== undefined, {
    message: "provide title and/or description",
  });

export const publishBody = z.object({ isPublished: z.boolean() });

export const deleteVideosBody = z.object({
  videoIds: z
    .array(objectId)
    .min(1)
    .max(50)
    .transform((ids) => [...new Set(ids)]),
});
