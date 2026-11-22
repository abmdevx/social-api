import { z } from "zod";
import { objectId, optionalText, text } from "./common.js";

export const playlistParams = z.object({ playlistId: objectId });
export const playlistVideoParams = z.object({ playlistId: objectId, videoId: objectId });
export const userPlaylistsParams = z.object({ userId: objectId });

export const createPlaylistBody = z.object({
  name: text(100),
  description: optionalText(500),
  videoIds: z
    .array(objectId)
    .max(200)
    .default([])
    .transform((ids) => [...new Set(ids)]),
});

export const updatePlaylistBody = z
  .object({
    name: text(100).optional(),
    description: z.string().trim().max(500).optional(),
  })
  .refine((value) => value.name !== undefined || value.description !== undefined, {
    message: "provide name and/or description",
  });
