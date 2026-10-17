"use client";

import { cn } from "cn";
import { UserIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { AVATAR_CROP_SIZE } from "../config/storage";
import { getInitials } from "../lib/get-initials";

const sizeClassNames = {
  sm: { avatar: "size-8", fallback: "text-xs" },
  lg: { avatar: "size-24", fallback: "text-2xl" },
  hero: {
    avatar: "size-auto aspect-square w-full rounded-2xl after:rounded-2xl",
    fallback: "text-2xl rounded-2xl",
  },
};

type ProfileAvatarProps = {
  displayName: string;
  avatarUrl: string | null;
  size?: keyof typeof sizeClassNames;
  className?: string;
  highPriority?: boolean;
};

export function ProfileAvatar({
  displayName,
  avatarUrl,
  size = "lg",
  className,
  highPriority = false,
}: ProfileAvatarProps) {
  const initials = getInitials(displayName);
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const hasImage = Boolean(avatarUrl && avatarUrl !== failedUrl);
  const pixels = size === "hero" ? AVATAR_CROP_SIZE : size === "sm" ? 32 : 96;

  return (
    <Avatar className={cn(sizeClassNames[size].avatar, className)}>
      {/* Без Referer: Google отвечает 429 на фото аккаунта, запрошенные с localhost,
          и не должен знать, с какой страницы сайта открыто фото */}
      <AvatarFallback aria-hidden={hasImage || undefined} className={sizeClassNames[size].fallback}>
        {initials || <UserIcon aria-hidden="true" className="size-1/2" />}
      </AvatarFallback>
      {hasImage && avatarUrl ? (
        <Image
          src={avatarUrl}
          alt={displayName}
          width={pixels}
          height={pixels}
          sizes={size === "hero" ? "(max-width: 448px) 100vw, 448px" : `${pixels}px`}
          // Фото провайдера и локальный blob показываем напрямую; сохранённое — через Next.js.
          unoptimized={!avatarUrl.includes("/storage/v1/object/public/avatars/")}
          loading={highPriority ? "eager" : "lazy"}
          fetchPriority={highPriority ? "high" : "auto"}
          referrerPolicy="no-referrer"
          onError={() => setFailedUrl(avatarUrl)}
          className="absolute inset-0 size-full rounded-[inherit] object-cover"
        />
      ) : null}
    </Avatar>
  );
}
