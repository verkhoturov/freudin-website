"use client";

import { toast } from "sonner";
import type { PublicProfile } from "@/entities/profile";
import { authProviderLabels, useSignOutMutation, type Viewer } from "@/entities/viewer";
import { routes } from "@/shared/config";
import { Button } from "@/shared/ui/button";
import { DeleteAccountDialog } from "./delete-account-dialog";

// Полная перезагрузка сбрасывает кеш запросов и всё состояние пользователя
function reloadToHome() {
  window.location.assign(routes.home);
}

type AccountSettingsProps = { viewer: Viewer; profile: PublicProfile };

/** Способ входа, выход и удаление аккаунта. */
export function AccountSettings({ viewer, profile }: AccountSettingsProps) {
  const signOut = useSignOutMutation();
  const { user } = viewer;
  const provider = user.provider ? authProviderLabels[user.provider] : null;
  const signInMethod = [provider, user.email].filter(Boolean).join(", ");

  const handleSignOut = () => {
    signOut.mutate(undefined, {
      onSuccess: reloadToHome,
      onError: () => toast.error("Couldn’t sign out. Please try again."),
    });
  };

  return (
    <section aria-labelledby="account-settings-title" className="flex flex-col gap-4">
      <h2 id="account-settings-title" className="font-semibold text-lg tracking-tight">
        Account
      </h2>
      {signInMethod ? (
        <p className="text-sm">
          <span className="text-muted-foreground">Signed in with: </span>
          {signInMethod}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" disabled={signOut.isPending} onClick={handleSignOut}>
          Sign out
        </Button>
        <DeleteAccountDialog username={profile.username} onDeleted={reloadToHome} />
      </div>
    </section>
  );
}
