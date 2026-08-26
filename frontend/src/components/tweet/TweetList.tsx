import type { Tweet } from "../../types/tweet";
import { TweetCard } from "./TweetCard";

export function TweetList({ tweets, currentUserId, selected, onSelect, onEdit, onDelete }: { tweets: Tweet[]; currentUserId?: string; selected: Set<string>; onSelect: (id: string) => void; onEdit: (tweet: Tweet) => void; onDelete: (tweet: Tweet) => void }) {
  return <div className="space-y-3">{tweets.map((tweet) => <TweetCard key={tweet._id} tweet={tweet} currentUserId={currentUserId} selected={selected.has(tweet._id)} onSelect={() => onSelect(tweet._id)} onEdit={() => onEdit(tweet)} onDelete={() => onDelete(tweet)} />)}</div>;
}
