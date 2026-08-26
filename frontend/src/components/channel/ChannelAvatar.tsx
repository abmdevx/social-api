import { Avatar } from "../ui/Avatar";

export function ChannelAvatar({ name, src }: { name: string; src?: string }) {
  return <div className="rounded-full bg-slate-950 p-1 shadow-xl shadow-black/30"><Avatar name={name} src={src} size="lg" className="ring-4 ring-slate-950 sm:size-24" /></div>;
}
