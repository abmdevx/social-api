import { Link } from "react-router-dom";
import { Menu, Radio, Search } from "lucide-react";
import { Button } from "../ui/Button";
import { CreateButton } from "./CreateButton";
import { NotificationButton } from "./NotificationButton";
import { SearchBar } from "./SearchBar";
import { UserMenu } from "./UserMenu";

export function TopNavbar({ onMenuClick, onSearch }: { onMenuClick: () => void; onSearch?: (query: string) => void }) {
  return <header className="fixed inset-x-0 top-0 z-40 h-20 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl">
    <div className="flex h-full items-center gap-3 px-4 sm:px-6 lg:px-8">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick} aria-label="Open navigation"><Menu size={20} /></Button>
      <Link to="/" className="flex shrink-0 items-center gap-2.5 text-lg font-semibold tracking-tight text-slate-100"><span className="flex size-9 items-center justify-center rounded-xl bg-cyan-400 text-slate-950"><Radio size={19} /></span><span className="hidden sm:inline">Streamline</span></Link>
      <div className="ml-auto flex w-full max-w-xl justify-center"><SearchBar onSearch={onSearch} /><Button variant="ghost" size="icon" className="md:hidden" aria-label="Search"><Search size={19} /></Button></div>
      <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2"><CreateButton /><NotificationButton /><UserMenu /></div>
    </div>
  </header>;
}
