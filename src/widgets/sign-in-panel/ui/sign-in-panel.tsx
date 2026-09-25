"use client";

import { authProviderLabels, authProviders, getSignInHref } from "@/entities/viewer";
import { Button } from "@/shared/ui/button";
import { ProviderIcon } from "./provider-icon";

/** Кнопки входа. `next` — куда вернуть пользователя после входа. */
export function SignInPanel({ next }: { next?: string }) {
  return (
    <ul className="flex flex-col gap-3">
      {authProviders.map((provider) => (
        <li key={provider}>
          <Button asChild variant="outline" size="lg" className="w-full">
            {/* Обычная ссылка, а не next/link: переход на API-роут с редиректом к провайдеру */}
            <a href={getSignInHref(provider, next)}>
              <ProviderIcon provider={provider} />
              Войти через {authProviderLabels[provider]}
            </a>
          </Button>
        </li>
      ))}
    </ul>
  );
}
