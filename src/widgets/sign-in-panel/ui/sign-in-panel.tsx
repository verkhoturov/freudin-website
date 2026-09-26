"use client";

import { authProviderLabels, enabledAuthProviders, getSignInHref } from "@/entities/viewer";
import { Button } from "@/shared/ui/button";
import { ProviderIcon } from "./provider-icon";

/** Кнопки входа через подключённых провайдеров. `next` — куда вернуть пользователя после входа. */
export function SignInPanel({ next }: { next?: string }) {
  return (
    <ul className="flex flex-col gap-3">
      {enabledAuthProviders.map((provider) => (
        <li key={provider}>
          <Button asChild variant="outline" size="lg" className="w-full">
            {/* Обычная ссылка, а не next/link: переход на API-роут с редиректом к провайдеру */}
            <a href={getSignInHref(provider, next)}>
              <ProviderIcon provider={provider} />
              Continue with {authProviderLabels[provider]}
            </a>
          </Button>
        </li>
      ))}
    </ul>
  );
}
