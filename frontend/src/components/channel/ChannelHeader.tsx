import { CalendarDays } from "lucide-react";
import type { Channel } from "../../types/channel";
import { ChannelAvatar } from "./ChannelAvatar";
import { SubscribeButton } from "./SubscribeButton";

export function ChannelHeader({ channel, onSubscribed }: { channel: Channel; onSubscribed: (value: boolean) => void }) {
  const joined = channel.createdAt ? new Intl.DateTimeFormat("en", { month: "short", year: "numeric" }).format(new Date(channel.createdAt)) : null;
  return <header className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50"><div className="h-36 bg-slate-800 sm:h-52">{channel.coverImage?.url && <img src={channel.coverImage.url} alt="" className="size-full object-cover" />}</div><div className="relative px-5 pb-6 sm:px-8"><div className="-mt-12 sm:-mt-14"><ChannelAvatar name={channel.fullName} src={channel.avatar?.url} /></div><div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"><div><h1 className="text-2xl font-semibold tracking-tight text-slate-100 sm:text-3xl">{channel.fullName}</h1><p className="mt-1 text-sm text-slate-500">@{channel.username}</p><div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-400"><span><strong className="text-slate-200">{channel.subscribersCount}</strong> subscribers</span><span><strong className="text-slate-200">{channel.ChannelsSubscribed}</strong> subscriptions</span>{joined && <span className="inline-flex items-center gap-1"><CalendarDays size={14} />Joined {joined}</span>}</div></div><SubscribeButton channelId={channel._id} subscribed={channel.isSubscribed} onChange={onSubscribed} /></div></div></header>;
}
