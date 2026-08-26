import type { Channel } from "../../types/channel";
import { ChannelCard } from "./ChannelCard";

export function SubscriptionList({ channels, onUnsubscribed }: { channels: Channel[]; onUnsubscribed: (channelId: string) => void }) {
  return <div className="space-y-3">{channels.map((channel) => <ChannelCard key={channel._id} channel={channel} onUnsubscribed={() => onUnsubscribed(channel._id)} />)}</div>;
}
