import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useViewerQuery } from "../api/viewer-queries";
import { getViewerRedirect, type ViewerAccess } from "./get-viewer-redirect";

/**
 * Перенаправляет, если текущему пользователю страница недоступна (см. `ViewerAccess`).
 * `next` — куда вести вошедшего пользователя со страницы входа.
 */
export function useViewerRedirect(access: ViewerAccess, next?: string) {
  const router = useRouter();
  const pathname = usePathname();
  const viewer = useViewerQuery();
  const redirectPath = viewer.isSuccess
    ? getViewerRedirect(access, viewer.data, { pathname, next })
    : null;

  useEffect(() => {
    if (redirectPath) router.replace(redirectPath);
  }, [redirectPath, router]);

  return { viewer, isRedirecting: redirectPath !== null };
}
