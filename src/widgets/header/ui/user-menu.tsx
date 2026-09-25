"use client";

import Link from "next/link";
import { toast } from "sonner";
import { ProfileAvatar } from "@/entities/profile";
import { useSignOutMutation, type Viewer } from "@/entities/viewer";
import { routes } from "@/shared/config";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";

export function UserMenu({ viewer }: { viewer: Viewer }) {
  const signOut = useSignOutMutation();
  const { profile, suggestions, user } = viewer;
  const name = profile?.displayName ?? suggestions.displayName ?? user.email ?? "";
  const avatarUrl = profile ? profile.avatarUrl : suggestions.avatarUrl;

  const handleSignOut = () => {
    signOut.mutate(undefined, {
      // Полная перезагрузка сбрасывает кеш запросов и всё состояние пользователя
      onSuccess: () => window.location.assign(routes.home),
      onError: () => toast.error("Не удалось выйти. Попробуйте ещё раз."),
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full" aria-label="Меню аккаунта">
          <ProfileAvatar displayName={name} avatarUrl={avatarUrl} size="sm" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {name ? <DropdownMenuLabel className="truncate">{name}</DropdownMenuLabel> : null}
        {profile ? (
          <>
            <DropdownMenuItem asChild>
              <Link href={routes.profile(profile.username)}>Моя страница</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={routes.settings}>Настройки</Link>
            </DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuItem asChild>
            <Link href={routes.onboarding}>Создать страницу</Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled={signOut.isPending} onSelect={handleSignOut}>
          Выйти
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
