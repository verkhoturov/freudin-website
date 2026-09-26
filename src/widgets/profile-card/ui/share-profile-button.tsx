"use client";

import { toast } from "sonner";
import { routes } from "@/shared/config";
import { copyToClipboard } from "@/shared/lib/clipboard";
import { Button } from "@/shared/ui/button";

type ShareProfileButtonProps = {
  username: string;
  displayName: string;
};

/** Системное меню «Поделиться», а где его нет — копирование ссылки. */
export function ShareProfileButton({ username, displayName }: ShareProfileButtonProps) {
  const share = async () => {
    const url = new URL(routes.profile(username), window.location.origin).toString();

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: displayName, url });
      } catch {
        // Пользователь закрыл меню — ничего не делаем
      }
      return;
    }

    if (await copyToClipboard(url)) toast.success("Link copied");
    else toast.error("Couldn’t copy the link");
  };

  return (
    <Button variant="ghost" onClick={share}>
      Share
    </Button>
  );
}
