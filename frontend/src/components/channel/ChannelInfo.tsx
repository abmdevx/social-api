import { Avatar } from "../ui/Avatar";
import { SubscribeButton } from "./SubscribeButton";

export function ChannelInfo({ channelId, name, avatar, subscriberCount, subscribed, onSubscribed }: { channelId: string; name: string; avatar?: string; subscriberCount: number | null; subscribed: boolean; onSubscribed: (value: boolean) => void }) {
  return <div className="flex items-center justify-between gap-4 border-y border-slate-800/80 py-4"><div className="flex min-w-0 items-center gap-3"><Avatar name={name} src={avatar} size="md" /><div className="min-w-0"><p className="truncate font-semibold text-slate-100">{name}</p><p className="text-xs text-slate-500">{subscriberCount === null ? "Subscribers unavailable" : `${new Intl.NumberFormat("en", { notation: "compact" }).format(subscriberCount)} subscribers`}</p></div></div>{channelId && <SubscribeButton channelId={channelId} subscribed={subscribed} onChange={onSubscribed} />}</div>;
}
