import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { LogOut, Menu, Search, Settings, Upload, UserRound } from "lucide-react";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { UserAvatar } from "@/components/common/UserAvatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { getErrorMessage } from "@/lib/errors";
import { Logo } from "./Logo";
import { SidebarNav } from "./Sidebar";

function SearchBox() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  // Re-keyed from the URL so the box reflects the active query after navigation.
  const urlQuery = params.get("q") ?? "";
  const [draft, setDraft] = useState<{ source: string; value: string }>({
    source: urlQuery,
    value: urlQuery,
  });
  const value = draft.source === urlQuery ? draft.value : urlQuery;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = value.trim();
    void navigate(trimmed ? `/?q=${encodeURIComponent(trimmed)}` : "/");
  };

  return (
    <form onSubmit={submit} role="search" className="relative w-full max-w-md">
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        value={value}
        onChange={(event) => setDraft({ source: urlQuery, value: event.target.value })}
        placeholder="Search videos"
        aria-label="Search videos"
        maxLength={100}
        className="pl-9"
      />
    </form>
  );
}

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const onLogout = async () => {
    try {
      await logout();
      void navigate("/login");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b bg-background/80 px-3 backdrop-blur sm:px-4">
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
            <Menu />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 gap-0 p-0">
          <SheetHeader className="border-b">
            <SheetTitle>Streamline</SheetTitle>
            <SheetDescription className="sr-only">Site navigation</SheetDescription>
          </SheetHeader>
          <SidebarNav onNavigate={() => setMenuOpen(false)} />
        </SheetContent>
      </Sheet>

      <Logo />
      <div className="mx-auto flex w-full flex-1 justify-center px-2">
        <SearchBox />
      </div>

      <div className="flex items-center gap-1">
        <Button asChild size="sm" className="hidden sm:inline-flex">
          <Link to="/studio?upload=1">
            <Upload /> Upload
          </Link>
        </Button>
        <ThemeToggle />
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="rounded-full outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                aria-label="Account menu"
              >
                <UserAvatar user={user} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="truncate">{user.fullName}</div>
                <div className="truncate text-xs font-normal text-muted-foreground">
                  @{user.username}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => void navigate(`/c/${user.username}`)}>
                <UserRound /> Your channel
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => void navigate("/settings")}>
                <Settings /> Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => void onLogout()}>
                <LogOut /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
