"use client";

import { type MouseEvent, useEffect, useState } from "react";
import {
  type AuthProvider,
  AuthProviderIcon,
  authProviderLabels,
  enabledAuthProviders,
  getSignInHref,
} from "@/entities/viewer";
import { Button } from "@/shared/ui/button";
import { Spinner } from "@/shared/ui/spinner";

// Клик с модификатором открывает вкладку или окно: эта страница никуда не уходит
function opensElsewhere(event: MouseEvent) {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
}

/** Кнопки входа через подключённых провайдеров. `next` — куда вернуть пользователя после входа. */
export function SignInPanel({ next }: { next?: string }) {
  // Провайдер, к которому уже ушёл браузер: до ответа сервера кнопка показывает ожидание
  const [pending, setPending] = useState<AuthProvider | null>(null);

  // «Назад» от провайдера может достать страницу из bfcache вместе со спиннером
  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) setPending(null);
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  return (
    <ul className="flex flex-col gap-3">
      {enabledAuthProviders.map((provider) => {
        const label = authProviderLabels[provider];
        const isPending = pending === provider;
        return (
          <li key={provider}>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full aria-busy:pointer-events-none aria-disabled:pointer-events-none aria-disabled:opacity-50">
              {/* Обычная ссылка, а не next/link: переход на API-роут с редиректом к провайдеру */}
              <a
                href={getSignInHref(provider, next)}
                aria-busy={isPending || undefined}
                aria-disabled={(pending !== null && !isPending) || undefined}
                onClick={(event) => {
                  if (opensElsewhere(event)) return;
                  if (pending) event.preventDefault();
                  else setPending(provider);
                }}>
                {isPending ? <Spinner /> : <AuthProviderIcon provider={provider} />}
                {isPending ? `Redirecting to ${label}…` : `Continue with ${label}`}
              </a>
            </Button>
          </li>
        );
      })}
    </ul>
  );
}
