import { Bell } from "lucide-react";
import { Button } from "../ui/Button";

export function NotificationButton() {
  return <Button variant="ghost" size="icon" aria-label="Notifications"><span className="relative"><Bell size={19} /><span className="absolute -right-1 -top-1 size-2 rounded-full bg-cyan-400 ring-2 ring-slate-950" /></span></Button>;
}
