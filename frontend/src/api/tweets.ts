import { apiClient, unwrap } from "./client";
import type { ApiResponse, LikeState, Tweet } from "@/types/models";

/** Tweets of the given user, or of the signed-in user when no id is passed. */
export async function getTweets(userId?: string): Promise<Tweet[]> {
  return unwrap(
    await apiClient.get<ApiResponse<Tweet[]>>("/tweets/get-tweets", {
      params: userId ? { userId } : {},
    })
  );
}

export async function createTweet(content: string): Promise<Tweet> {
  return unwrap(await apiClient.post<ApiResponse<Tweet>>("/tweets/create-tweet", { content }));
}

export async function updateTweet(tweetId: string, content: string): Promise<Tweet> {
  return unwrap(await apiClient.patch<ApiResponse<Tweet>>(`/tweets/t/${tweetId}`, { content }));
}

export async function deleteTweet(tweetId: string): Promise<void> {
  await apiClient.delete(`/tweets/t/${tweetId}`);
}

export async function deleteTweets(tweetIds: string[]): Promise<number> {
  const result = unwrap(
    await apiClient.delete<ApiResponse<{ deletedCount: number }>>("/tweets/delete-bulk-tweets", {
      data: { tweetIds },
    })
  );
  return result.deletedCount;
}

export async function toggleTweetLike(tweetId: string): Promise<LikeState> {
  return unwrap(await apiClient.post<ApiResponse<LikeState>>(`/likes/t/${tweetId}`));
}
