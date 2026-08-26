import apiClient from "./client";
import type { ApiResponse } from "../types/api";
import type { Tweet } from "../types/tweet";

export async function getTweets() {
  const response = await apiClient.get<ApiResponse<Tweet[]>>("/tweets/get-tweets");
  return response.data.data;
}

export async function createTweet(content: string) {
  const response = await apiClient.post<ApiResponse<Tweet>>("/tweets/create-tweet", { content });
  return response.data.data;
}

export async function updateTweet(tweetId: string, content: string) {
  const response = await apiClient.patch<ApiResponse<Tweet>>(`/tweets/t/${tweetId}`, { updatedTweetContent: content });
  return response.data.data;
}

export async function deleteTweet(tweetId: string) {
  await apiClient.delete<ApiResponse<Tweet>>(`/tweets/t/${tweetId}`);
}

export async function deleteTweets(tweetsIds: string[]) {
  await apiClient.delete<ApiResponse<unknown>>("/tweets/delete-bulk-tweets", { data: { tweetsIds } });
}

export async function toggleTweetLike(tweetId: string) {
  const response = await apiClient.post<ApiResponse<{ Like: boolean }>>(`/likes/t/${tweetId}`);
  return response.data.data.Like;
}
