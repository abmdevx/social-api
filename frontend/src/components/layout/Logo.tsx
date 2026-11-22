import { Link } from "react-router-dom";
import { Play } from "lucide-react";

export function Logo() {
  return (
    <Link
      to="/"
      className="flex items-center gap-2 rounded-md font-semibold tracking-tight outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
    >
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Play className="size-4 fill-current" />
      </span>
      <span className="text-lg">Streamline</span>
    </Link>
  );
}
