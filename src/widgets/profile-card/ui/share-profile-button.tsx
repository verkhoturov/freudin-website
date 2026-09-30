"use client";

import { CopyIcon, DownloadIcon, Share2Icon } from "lucide-react";
import dynamic from "next/dynamic";
import { useRef } from "react";
import { routes, siteConfig } from "@/shared/config";
import { copyToClipboard } from "@/shared/lib/clipboard";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { toast } from "@/shared/ui/sonner";

// Библиотека QR-кода грузится, только когда открыли диалог. Заглушка того же размера
const QrCode = dynamic(() => import("./qr-code").then((module) => module.QrCode), {
  loading: () => <div className="mx-auto aspect-square w-full max-w-60 rounded-md bg-muted" />,
});

type ShareProfileButtonProps = {
  username: string;
  displayName: string;
};

/** Диалог «Поделиться»: QR-код страницы, копирование ссылки и системное меню, где оно есть. */
export function ShareProfileButton({ username, displayName }: ShareProfileButtonProps) {
  const qrRef = useRef<HTMLCanvasElement>(null);
  // Прод-адрес, а не текущий origin: QR-код печатают на визитках
  const url = new URL(routes.profile(username), siteConfig.url).toString();
  const canShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  const share = async () => {
    try {
      await navigator.share({ title: displayName, url });
    } catch {
      // Пользователь закрыл меню — ничего не делаем
    }
  };

  const copy = async () => {
    if (await copyToClipboard(url)) toast.success("Link copied");
    else toast.error("Couldn’t copy the link. Please try again.");
  };

  const download = () => {
    const canvas = qrRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `freudin-${username}-qr.png`;
    link.click();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost">Share</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-120">
        <DialogHeader>
          <DialogTitle>Share page</DialogTitle>
          <DialogDescription className="break-all">
            {url.replace(/^https:\/\//, "")}
          </DialogDescription>
        </DialogHeader>
        <QrCode canvasRef={qrRef} value={url} label={`QR code for ${displayName}’s page`} />
        <DialogFooter className="sm:flex-wrap sm:*:grow">
          <Button variant="outline" onClick={download}>
            <DownloadIcon aria-hidden="true" />
            Download QR code
          </Button>
          <Button variant="outline" onClick={copy}>
            <CopyIcon aria-hidden="true" />
            Copy link
          </Button>
          {canShare ? (
            <Button variant="outline" onClick={share}>
              <Share2Icon aria-hidden="true" />
              Share via…
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
