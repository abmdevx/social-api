import { z } from "zod";
import { objectId, pageQuery, text } from "./common.js";

export const videoParams = z.object({ videoId: objectId });
export const commentParams = z.object({ commentId: objectId, videoId: objectId });
export const listCommentsQuery = pageQuery;
export const commentBody = z.object({ content: text(2000) });
