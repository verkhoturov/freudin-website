"use client";

import { useState } from "react";
import Cropper, { type Area, type Point } from "react-easy-crop";
import { toast } from "sonner";
import { AVATAR_SIZE } from "@/entities/profile";
import { cropImage } from "@/shared/lib/crop-image";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Slider } from "@/shared/ui/slider";

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;

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
          <DialogTitle>Фото профиля</DialogTitle>
          <DialogDescription>Выберите область фото.</DialogDescription>
        </DialogHeader>
        {/* key сбрасывает масштаб и положение для новой картинки */}
        {src ? <CropArea key={src} src={src} onCancel={onCancel} onConfirm={onConfirm} /> : null}
      </DialogContent>
    </Dialog>
  );
}

type CropAreaProps = { src: string; onCancel: () => void; onConfirm: (file: Blob) => void };

function CropArea({ src, onCancel, onConfirm }: CropAreaProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [area, setArea] = useState<Area | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const save = async () => {
    if (!area) return;
    setIsSaving(true);
    try {
      onConfirm(await cropImage(src, area, AVATAR_SIZE));
    } catch {
      toast.error("Не удалось обработать фото. Попробуйте другое.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted">
        <Cropper
          image={src}
          crop={crop}
          zoom={zoom}
          minZoom={MIN_ZOOM}
          maxZoom={MAX_ZOOM}
          aspect={1}
          cropShape="round"
          showGrid={false}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={(_, pixels) => setArea(pixels)}
        />
      </div>
      <Slider
        aria-label="Масштаб"
        min={MIN_ZOOM}
        max={MAX_ZOOM}
        step={0.01}
        value={[zoom]}
        onValueChange={([value]) => setZoom(value ?? MIN_ZOOM)}
      />
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Отмена
        </Button>
        <Button type="button" onClick={save} disabled={!area || isSaving}>
          Готово
        </Button>
      </DialogFooter>
    </>
  );
}
