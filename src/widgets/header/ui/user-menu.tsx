"use client";

import Link from "next/link";
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
import { toast } from "@/shared/ui/sonner";

const SIGN_OUT_TOAST_ID = "sign-out";

export function UserMenu({ viewer }: { viewer: Viewer }) {
  const signOut = useSignOutMutation();
  const { profile, suggestions, user } = viewer;
  const name = profile?.displayName ?? suggestions.displayName ?? user.email ?? "";
  const avatarUrl = profile ? profile.avatarUrl : suggestions.avatarUrl;

  const handleSignOut = () => {
    // Меню закрывается сразу, поэтому ожидание показывает тост; ошибка заменит его тем же id
    toast.loading("Signing out…", { id: SIGN_OUT_TOAST_ID });
    signOut.mutate(undefined, {
      // Полная перезагрузка сбрасывает кеш запросов и всё состояние пользователя
      onSuccess: () => window.location.assign(routes.home),
      onError: () => toast.error("Couldn’t sign out. Please try again.", { id: SIGN_OUT_TOAST_ID }),
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full" aria-label="Account menu">
          <ProfileAvatar displayName={name} avatarUrl={avatarUrl} size="sm" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {name ? <DropdownMenuLabel className="truncate">{name}</DropdownMenuLabel> : null}
        {profile ? (
          <>
            <DropdownMenuItem asChild>
              <Link href={routes.profile(profile.username)}>My page</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={routes.settings}>Settings</Link>
            </DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuItem asChild>
            <Link href={routes.onboarding}>Create page</Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled={signOut.isPending} onSelect={handleSignOut}>
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
