import { useEffect } from "react";

const LEAVE_MESSAGE = "You have unsaved changes. Leave this page?";

function isModifiedClick(event: MouseEvent): boolean {
  return event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
}

// Ссылка, по которой браузер или next/link уведёт с текущей страницы в этой вкладке
function getLeavingLink(event: MouseEvent): HTMLAnchorElement | null {
  if (event.defaultPrevented || isModifiedClick(event)) return null;
  const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
  if (!(link instanceof HTMLAnchorElement)) return null;
  if (link.target === "_blank" || link.hasAttribute("download")) return null;

  const url = new URL(link.href);
  const current = window.location;
  const isSamePage = url.pathname === current.pathname && url.search === current.search;
  return url.origin === current.origin && isSamePage ? null : link;
}

/**
 * Предупреждает об уходе со страницы, пока `enabled`: при закрытии и перезагрузке вкладки —
 * окном браузера, при переходе по ссылке — через `confirm`. Кнопку «Назад» App Router
 * перехватить не даёт.
 */
export function useUnsavedChangesWarning(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault();
    // Фаза перехвата на document срабатывает раньше обработчика next/link
    const handleClick = (event: MouseEvent) => {
      if (!getLeavingLink(event) || window.confirm(LEAVE_MESSAGE)) return;
      event.preventDefault();
      event.stopPropagation();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("click", handleClick, true);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("click", handleClick, true);
    };
  }, [enabled]);
}
