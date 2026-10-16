import { useEffect } from "react";

function isModifiedClick(event: MouseEvent): boolean {
  return event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
}

// Адрес ссылки, по которой браузер или next/link уведёт с текущей страницы в этой вкладке.
// Другой query или хеш на том же пути — не уход: страница остаётся смонтированной
function getLeavingUrl(event: MouseEvent): URL | null {
  if (event.defaultPrevented || isModifiedClick(event)) return null;
  const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
  if (!(link instanceof HTMLAnchorElement)) return null;
  if (link.target === "_blank" || link.hasAttribute("download")) return null;

  const url = new URL(link.href);
  // mailto: и tel: открывают другое приложение, страница остаётся
  if (url.protocol !== "http:" && url.protocol !== "https:") return null;
  const isSamePage =
    url.origin === window.location.origin && url.pathname === window.location.pathname;
  return isSamePage ? null : url;
}

/**
 * Предупреждает об уходе со страницы, пока `enabled`: при закрытии и перезагрузке вкладки —
 * окном браузера, переход по ссылке отменяет и передаёт адрес в `onLeave` (страница спрашивает
 * сама). Кнопку «Назад» App Router перехватить не даёт.
 */
export function useUnsavedChangesWarning(enabled: boolean, onLeave: (url: URL) => void) {
  useEffect(() => {
    if (!enabled) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault();
    // Фаза перехвата на document срабатывает раньше обработчика next/link
    const handleClick = (event: MouseEvent) => {
      const url = getLeavingUrl(event);
      if (!url) return;
      event.preventDefault();
      event.stopPropagation();
      onLeave(url);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("click", handleClick, true);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("click", handleClick, true);
    };
  }, [enabled, onLeave]);
}
