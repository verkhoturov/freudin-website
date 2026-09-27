"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { authProviderLabels, getAuthErrorMessage, identityLinkParams } from "@/entities/viewer";

// Один id: в dev React Strict Mode вызывает эффект дважды, и тост не дублируется
const TOAST_ID = "identity-link";

function getProviderLabel(provider: string): string {
  return Object.hasOwn(authProviderLabels, provider)
    ? authProviderLabels[provider as keyof typeof authProviderLabels]
    : "Sign-in method";
}

/**
 * Итог привязки способа входа после возврата от провайдера: `?linked=` или `?link_error=`.
 * Показывает тост и убирает параметры из адреса, чтобы тост не повторился при обновлении.
 * Используется внутри Suspense: `useSearchParams` на статической странице.
 */
export function IdentityLinkToast() {
  const searchParams = useSearchParams();
  const linked = searchParams.get(identityLinkParams.linked);
  const linkError = searchParams.get(identityLinkParams.error);

  useEffect(() => {
    if (!linked && !linkError) return;
    if (linked) toast.success(`${getProviderLabel(linked)} connected`, { id: TOAST_ID });
    else if (linkError) toast.error(getAuthErrorMessage(linkError), { id: TOAST_ID });

    const url = new URL(window.location.href);
    url.searchParams.delete(identityLinkParams.linked);
    url.searchParams.delete(identityLinkParams.error);
    window.history.replaceState(window.history.state, "", url);
  }, [linked, linkError]);

  return null;
}
