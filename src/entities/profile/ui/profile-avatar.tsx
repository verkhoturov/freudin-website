import { UserIcon } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { getInitials } from "../lib/get-initials";

const sizeClassNames = {
  sm: { avatar: "size-8", fallback: "text-xs" },
  lg: { avatar: "size-24", fallback: "text-2xl" },
};

type ProfileAvatarProps = {
  displayName: string;
  avatarUrl: string | null;
  size?: keyof typeof sizeClassNames;
  className?: string;
};

export function ProfileAvatar({
  displayName,
  avatarUrl,
  size = "lg",
  className,
}: ProfileAvatarProps) {
  const initials = getInitials(displayName);

  return (
    <Avatar className={cn(sizeClassNames[size].avatar, className)}>
      {/* Без Referer: Google отвечает 429 на фото аккаунта, запрошенные с localhost,
          и не должен знать, с какой страницы сайта открыто фото */}
      {avatarUrl ? (
        <AvatarImage src={avatarUrl} alt={displayName} referrerPolicy="no-referrer" />
      ) : null}
      <AvatarFallback className={sizeClassNames[size].fallback}>
        {initials || <UserIcon aria-hidden="true" className="size-1/2" />}
      </AvatarFallback>
    </Avatar>
  );
}
