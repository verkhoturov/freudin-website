"use client";

import { useEffect } from "react";
import {
  type AuthProvider,
  AuthProviderIcon,
  authProviderLabels,
  enabledAuthProviders,
  type SignInMethod,
  useLinkIdentityMutation,
  useUnlinkIdentityMutation,
} from "@/entities/viewer";
import { ApiError } from "@/shared/api";
import { Button } from "@/shared/ui/button";
import { toast } from "@/shared/ui/sonner";
import { Spinner } from "@/shared/ui/spinner";

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.message : fallback;
}

/**
 * Способы входа аккаунта: привязанные можно отвязать (кроме последнего), остальные подключённые
 * провайдеры — привязать. Привязка уводит браузер к провайдеру, итог показывает
 * `IdentityLinkToast` после возврата.
 */
export function SignInMethods({ signInMethods }: { signInMethods: SignInMethod[] }) {
  const link = useLinkIdentityMutation();
  const unlink = useUnlinkIdentityMutation();
  const { reset: resetLink } = link;
  // После успеха браузер уходит к провайдеру: до этого кнопки остаются неактивными
  const isRedirecting = link.isPending || link.isSuccess;
  const isBusy = isRedirecting || unlink.isPending;
  const isOnlyMethod = signInMethods.length < 2;

  // «Назад» от провайдера может достать страницу из bfcache вместе с состоянием ожидания
  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) resetLink();
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, [resetLink]);

  const methods = new Map(signInMethods.map((method) => [method.provider, method]));
  // Привязанный способ, который на сайте уже отключили, тоже показываем: его можно отвязать
  const providers: AuthProvider[] = [
    ...enabledAuthProviders,
    ...signInMethods
      .map((method) => method.provider)
      .filter((provider) => !enabledAuthProviders.includes(provider)),
  ];

  const connect = (provider: AuthProvider) => {
    link.mutate(
      { provider },
      {
        onSuccess: ({ url }) => window.location.assign(url),
        onError: (error) =>
          toast.error(
            getErrorMessage(error, "Couldn’t connect this sign-in method. Please try again."),
          ),
      },
    );
  };

  const disconnect = (provider: AuthProvider) => {
    unlink.mutate(provider, {
      onSuccess: () => toast.success(`${authProviderLabels[provider]} disconnected`),
      onError: (error) =>
        toast.error(
          getErrorMessage(error, "Couldn’t disconnect this sign-in method. Please try again."),
        ),
    });
  };

  return (
    <section aria-labelledby="sign-in-methods-title" className="flex flex-col gap-3">
      <h3 id="sign-in-methods-title" className="font-medium text-sm">
        Sign-in methods
      </h3>
      <ul className="flex flex-col divide-y rounded-lg border">
        {providers.map((provider) => {
          const method = methods.get(provider);
          const label = authProviderLabels[provider];
          return (
            <li key={provider} className="flex items-center gap-3 px-3 py-2.5">
              <AuthProviderIcon provider={provider} />
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="text-sm">{label}</span>
                {method?.accountLabel ? (
                  <span className="truncate text-muted-foreground text-sm">
                    {method.accountLabel}
                  </span>
                ) : null}
              </div>
              {method ? (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isOnlyMethod || isBusy}
                  onClick={() => disconnect(provider)}>
                  {unlink.isPending && unlink.variables === provider ? (
                    <>
                      <Spinner />
                      Disconnecting…
                    </>
                  ) : (
                    "Disconnect"
                  )}
                  <span className="sr-only"> {label}</span>
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isBusy}
                  onClick={() => connect(provider)}>
                  {isRedirecting && link.variables?.provider === provider ? (
                    <>
                      <Spinner />
                      Redirecting…
                    </>
                  ) : (
                    "Connect"
                  )}
                  <span className="sr-only"> {label}</span>
                </Button>
              )}
            </li>
          );
        })}
      </ul>
      {isOnlyMethod ? (
        <p className="text-muted-foreground text-sm">
          Connect another method before disconnecting this one.
        </p>
      ) : null}
    </section>
  );
}
