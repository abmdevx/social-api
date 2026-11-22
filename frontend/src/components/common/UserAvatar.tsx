import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Owner } from "@/types/models";

export function UserAvatar({
  user,
  className,
}: {
  user: Pick<Owner, "fullName" | "avatar">;
  className?: string;
}) {
  return (
    <Avatar className={cn("size-9", className)}>
      {user.avatar?.url && <AvatarImage src={user.avatar.url} alt="" />}
      <AvatarFallback>{initials(user.fullName)}</AvatarFallback>
    </Avatar>
  );
}
