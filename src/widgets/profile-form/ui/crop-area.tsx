"use client";

import { useState } from "react";
import Cropper, { type Area, type Point } from "react-easy-crop";
import { AVATAR_SIZE } from "@/entities/profile";
import { cropImage } from "@/shared/lib/crop-image";
import { Button } from "@/shared/ui/button";
import { DialogFooter } from "@/shared/ui/dialog";
import { Slider } from "@/shared/ui/slider";
import { toast } from "@/shared/ui/sonner";
import { Spinner } from "@/shared/ui/spinner";

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;

type CropAreaProps = { src: string; onCancel: () => void; onConfirm: (file: Blob) => void };

export function CropArea({ src, onCancel, onConfirm }: CropAreaProps) {
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
      toast.error("Couldn’t process the photo. Try another one.");
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
        aria-label="Zoom"
        min={MIN_ZOOM}
        max={MAX_ZOOM}
        step={0.01}
        value={[zoom]}
        onValueChange={([value]) => setZoom(value ?? MIN_ZOOM)}
      />
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="button" onClick={save} disabled={!area || isSaving}>
          {isSaving ? <Spinner /> : null}
          Done
        </Button>
      </DialogFooter>
    </>
  );
}
