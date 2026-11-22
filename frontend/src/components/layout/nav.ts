import {
  Clapperboard,
  Compass,
  History,
  Home,
  ListVideo,
  MessageSquare,
  ThumbsUp,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/explore", label: "Trending", icon: Compass },
  { to: "/tweets", label: "Community", icon: MessageSquare },
  { to: "/subscriptions", label: "Subscriptions", icon: Users },
  { to: "/history", label: "History", icon: History },
  { to: "/liked", label: "Liked videos", icon: ThumbsUp },
  { to: "/playlists", label: "Playlists", icon: ListVideo },
  { to: "/studio", label: "Studio", icon: Clapperboard },
];
