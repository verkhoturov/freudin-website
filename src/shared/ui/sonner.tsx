"use client";

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import {
  type ExternalToast,
  Toaster as Sonner,
  // biome-ignore lint/style/noRestrictedImports: единственное место, где берём toast из sonner
  toast as sonnerToast,
  type ToasterProps,
} from "sonner";

/** Сколько держится тост. Ошибка и предупреждение — вдвое дольше (решение 28.09.2026). */
const TOAST_DURATION = 4000;

type ToastMessage = Parameters<typeof sonnerToast.success>[0];
type ToastKind = "success" | "info" | "error" | "warning";

// id тоста — его текст: повторный «Link copied» заменяет прежний, а не встаёт в стопку
function show(kind: ToastKind, duration: number) {
  return (message: ToastMessage, data?: ExternalToast) =>
    sonnerToast[kind](message, {
      id: typeof message === "string" ? message : undefined,
      duration,
      ...data,
    });
}

/** Тосты сайта: берём отсюда, а не из sonner (правило Biome). */
export const toast = {
  success: show("success", TOAST_DURATION),
  info: show("info", TOAST_DURATION),
  error: show("error", TOAST_DURATION * 2),
  warning: show("warning", TOAST_DURATION * 2),
  loading: (message: ToastMessage, data?: ExternalToast) => sonnerToast.loading(message, data),
  dismiss: sonnerToast.dismiss,
};

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      richColors
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          // richColors красит тосты по типу: успех и ошибка — своими токенами, остальные — как обычные
          "--success-bg": "var(--success)",
          "--success-text": "var(--success-foreground)",
          "--success-border": "var(--success)",
          "--error-bg": "var(--error)",
          "--error-text": "var(--error-foreground)",
          "--error-border": "var(--error)",
          "--info-bg": "var(--popover)",
          "--info-text": "var(--popover-foreground)",
          "--info-border": "var(--border)",
          "--warning-bg": "var(--popover)",
          "--warning-text": "var(--popover-foreground)",
          "--warning-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
