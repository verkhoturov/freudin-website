"use client";

import dynamic from "next/dynamic";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Skeleton } from "@/shared/ui/skeleton";

// Кроп (react-easy-crop) грузится, только когда выбрали файл
const CropArea = dynamic(() => import("./crop-area").then((module) => module.CropArea), {
  loading: () => <Skeleton className="aspect-square w-full rounded-lg" />,
});

type AvatarCropDialogProps = {
  /** Object URL выбранной картинки; `null` — диалог закрыт. */
  src: string | null;
  onCancel: () => void;
  onConfirm: (file: Blob) => void;
};

export function AvatarCropDialog({ src, onCancel, onConfirm }: AvatarCropDialogProps) {
  return (
    <Dialog open={src !== null} onOpenChange={(open) => (open ? undefined : onCancel())}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Profile photo</DialogTitle>
          <DialogDescription>Choose the part of the photo to show.</DialogDescription>
        </DialogHeader>
        {/* key сбрасывает масштаб и положение для новой картинки */}
        {src ? <CropArea key={src} src={src} onCancel={onCancel} onConfirm={onConfirm} /> : null}
      </DialogContent>
    </Dialog>
  );
}
