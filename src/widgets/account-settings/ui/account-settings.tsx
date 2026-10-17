"use client";

import { Suspense } from "react";
import type { PublicProfile } from "@/entities/profile";
import { useSignOutMutation, type Viewer } from "@/entities/viewer";
import { routes } from "@/shared/config";
import { Button } from "@/shared/ui/button";
import { toast } from "@/shared/ui/sonner";
import { Spinner } from "@/shared/ui/spinner";
import { DeleteAccountDialog } from "./delete-account-dialog";
import { IdentityLinkToast } from "./identity-link-toast";
import { SignInMethods } from "./sign-in-methods";

type AccountSettingsProps = {
  viewer: Viewer;
  profile: PublicProfile;
  beforeLeave: (action: () => void) => void;
};

/** Способы входа, выход и удаление аккаунта. Заголовок раздела рисует страница. */
export function AccountSettings({ viewer, profile, beforeLeave }: AccountSettingsProps) {
  const signOut = useSignOutMutation();
  const isSigningOut = signOut.isPending || signOut.isSuccess;

  const handleSignOut = async () => {
    try {
      await signOut.mutateAsync();
      // Полная перезагрузка сбрасывает кеш запросов и всё состояние пользователя
      window.location.assign(routes.home);
    } catch {
      toast.error("Couldn’t sign out. Please try again.");
    }
  };

  return (
    <div className="flex flex-col gap-6 border-t pt-6">
      <p className="text-muted-foreground text-sm">
        Sign-in changes, signing out and deleting your account take effect immediately, without
        Save.
      </p>
      {/* useSearchParams на статической странице работает только внутри Suspense */}
      <Suspense fallback={null}>
        <IdentityLinkToast />
      </Suspense>
      <SignInMethods signInMethods={viewer.user.signInMethods} beforeLeave={beforeLeave} />
      <div className="flex flex-wrap gap-2">
        {/* После успеха страница перезагружается: до этого кнопка остаётся в ожидании */}
        <Button
          variant="outline"
          disabled={isSigningOut}
          onClick={() => beforeLeave(handleSignOut)}>
          {isSigningOut ? <Spinner /> : null}
          {isSigningOut ? "Signing out…" : "Sign out"}
        </Button>
        <DeleteAccountDialog username={profile.username} />
      </div>
    </div>
  );
}
