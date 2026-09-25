import { cn } from "@/shared/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { getInitials } from "../lib/get-initials";

type ProfileAvatarProps = {
  displayName: string;
  avatarUrl: string | null;
  className?: string;
};

export function ProfileAvatar({ displayName, avatarUrl, className }: ProfileAvatarProps) {
  return (
    <Avatar className={cn("size-24", className)}>
      {avatarUrl ? <AvatarImage src={avatarUrl} alt={displayName} /> : null}
      <AvatarFallback className="text-2xl">{getInitials(displayName)}</AvatarFallback>
    </Avatar>
  );
}
