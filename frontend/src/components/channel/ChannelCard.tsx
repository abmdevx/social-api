import { Link } from "react-router-dom";
import { Avatar } from "../ui/Avatar";
import { SubscribeButton } from "./SubscribeButton";
import type { Channel } from "../../types/channel";

export function ChannelCard({ channel, onUnsubscribed }: { channel: Channel; onUnsubscribed: () => void }) {
  return <article className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/50 p-4 sm:flex-row sm:items-center"><Link to={`/channel/${channel.username}`} className="flex min-w-0 flex-1 items-center gap-3"><Avatar name={channel.fullName} src={channel.avatar?.url} size="md" /><div className="min-w-0"><h2 className="truncate font-semibold text-slate-100 hover:text-cyan-300">{channel.fullName}</h2><p className="truncate text-sm text-slate-500">@{channel.username}</p></div></Link><SubscribeButton channelId={channel._id} subscribed onChange={(subscribed) => { if (!subscribed) onUnsubscribed(); }} /></article>;
}
