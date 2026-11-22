import { apiClient, unwrap } from "./client";
import type { ApiResponse, Owner } from "@/types/models";

export async function toggleSubscription(
  channelId: string
): Promise<{ subscribed: boolean; subscribersCount: number }> {
  return unwrap(
    await apiClient.post<ApiResponse<{ subscribed: boolean; subscribersCount: number }>>(
      `/subscriptions/c/${channelId}`
    )
  );
}

export async function getSubscribedChannels(
  userId: string
): Promise<{ subscribedChannelsCount: number; channels: Owner[] }> {
  return unwrap(
    await apiClient.get<ApiResponse<{ subscribedChannelsCount: number; channels: Owner[] }>>(
      `/subscriptions/u/${userId}`
    )
  );
}
