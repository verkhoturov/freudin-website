"use client";

import { Suspense } from "react";
import { toast } from "sonner";
import type { PublicProfile } from "@/entities/profile";
import { useSignOutMutation, type Viewer } from "@/entities/viewer";
import { routes } from "@/shared/config";
import { Button } from "@/shared/ui/button";
import { DeleteAccountDialog } from "./delete-account-dialog";
import { IdentityLinkToast } from "./identity-link-toast";
import { SignInMethods } from "./sign-in-methods";

type AccountSettingsProps = { viewer: Viewer; profile: PublicProfile };

/** Способы входа, выход и удаление аккаунта. */
export function AccountSettings({ viewer, profile }: AccountSettingsProps) {
  const signOut = useSignOutMutation();

  const handleSignOut = () => {
    signOut.mutate(undefined, {
      // Полная перезагрузка сбрасывает кеш запросов и всё состояние пользователя
      onSuccess: () => window.location.assign(routes.home),
      onError: () => toast.error("Couldn’t sign out. Please try again."),
    });
  };

  return (
    <section aria-labelledby="account-settings-title" className="flex flex-col gap-6">
      <h2 id="account-settings-title" className="font-semibold text-lg tracking-tight">
        Account
      </h2>
      {/* useSearchParams на статической странице работает только внутри Suspense */}
      <Suspense fallback={null}>
        <IdentityLinkToast />
      </Suspense>
      <SignInMethods signInMethods={viewer.user.signInMethods} />
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" disabled={signOut.isPending} onClick={handleSignOut}>
          Sign out
        </Button>
        <DeleteAccountDialog username={profile.username} />
      </div>
    </section>
  );
}
