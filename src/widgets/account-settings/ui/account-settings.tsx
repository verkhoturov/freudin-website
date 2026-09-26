"use client";

import { toast } from "sonner";
import {
  authProviderLabels,
  useDeleteAccountMutation,
  useSignOutMutation,
  type Viewer,
} from "@/entities/viewer";
import { routes, siteConfig } from "@/shared/config";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/ui/alert-dialog";
import { Button } from "@/shared/ui/button";

const SITE_HOST = new URL(siteConfig.url).host;

// Полная перезагрузка сбрасывает кеш запросов и всё состояние пользователя
function reloadToHome() {
  window.location.assign(routes.home);
}

/** Способ входа, выход и удаление аккаунта. */
export function AccountSettings({ viewer }: { viewer: Viewer }) {
  const signOut = useSignOutMutation();
  const deleteAccount = useDeleteAccountMutation();
  const { user, profile } = viewer;
  const provider = user.provider ? authProviderLabels[user.provider] : null;
  const signInMethod = [provider, user.email].filter(Boolean).join(", ");

  const handleSignOut = () => {
    signOut.mutate(undefined, {
      onSuccess: reloadToHome,
      onError: () => toast.error("Не удалось выйти. Попробуйте ещё раз."),
    });
  };

  const handleDelete = () => {
    deleteAccount.mutate(undefined, {
      onSuccess: reloadToHome,
      onError: () => toast.error("Не удалось удалить аккаунт. Попробуйте ещё раз."),
    });
  };

  return (
    <section aria-labelledby="account-settings-title" className="flex flex-col gap-4">
      <h2 id="account-settings-title" className="font-semibold text-lg tracking-tight">
        Аккаунт
      </h2>
      {signInMethod ? (
        <p className="text-sm">
          <span className="text-muted-foreground">Способ входа: </span>
          {signInMethod}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" disabled={signOut.isPending} onClick={handleSignOut}>
          Выйти
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">Удалить аккаунт</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Удалить аккаунт?</AlertDialogTitle>
              <AlertDialogDescription>
                {profile ? `Страница ${SITE_HOST}/${profile.username}, фото и ссылки` : "Данные"}{" "}
                удалятся навсегда. Отменить это нельзя.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleteAccount.isPending}>Отмена</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                disabled={deleteAccount.isPending}
                onClick={(event) => {
                  // Диалог остаётся открытым, пока идёт удаление
                  event.preventDefault();
                  handleDelete();
                }}>
                {deleteAccount.isPending ? "Удаляем…" : "Удалить"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </section>
  );
}
