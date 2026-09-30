"use client";

import { type ChangeEvent, useRef, useState } from "react";
import { ProfileAvatar } from "@/entities/profile";
import type { AccountPhoto } from "@/entities/viewer";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { FieldLegend, FieldSet } from "@/shared/ui/field";
import { toast } from "@/shared/ui/sonner";
import type { AvatarValue } from "../model/avatar-value";
import { AvatarCropDialog } from "./avatar-crop-dialog";

// Исходник до кропа: большие фото с телефона браузер ещё открывает, дальше — вряд ли
const SOURCE_MAX_BYTES = 30 * 1024 * 1024;
const ACCEPTED_TYPES = "image/jpeg,image/png,image/webp";

type AvatarFieldProps = {
  value: AvatarValue;
  onChange: (value: AvatarValue) => void;
  /** Для инициалов, пока фото нет. */
  displayName: string;
  /** Фото, которое уже есть в профиле. */
  currentAvatarUrl: string | null;
  /** Фото из аккаунтов привязанных провайдеров входа. */
  accountPhotos: AccountPhoto[];
  disabled?: boolean;
};

function getPreviewUrl(
  value: AvatarValue,
  currentAvatarUrl: string | null,
  accountPhotos: AccountPhoto[],
): string | null {
  switch (value.type) {
    case "current":
      return currentAvatarUrl;
    case "provider":
      return accountPhotos.find((photo) => photo.provider === value.provider)?.avatarUrl ?? null;
    case "file":
      return value.previewUrl;
    case "none":
      return null;
  }
}

export function AvatarField({
  value,
  onChange,
  displayName,
  currentAvatarUrl,
  accountPhotos,
  disabled,
}: AvatarFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const previewUrl = getPreviewUrl(value, currentAvatarUrl, accountPhotos);
  // Фото аккаунтов, кроме уже выбранного
  const otherPhotos = accountPhotos.filter(
    (photo) => value.type !== "provider" || photo.provider !== value.provider,
  );

  const closeCrop = () => {
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
  };

  const selectFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Сбрасываем, чтобы тот же файл можно было выбрать ещё раз
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Choose a JPEG, PNG, or WebP photo.");
      return;
    }
    if (file.size > SOURCE_MAX_BYTES) {
      toast.error("The file is too large. Choose a smaller photo.");
      return;
    }
    setCropSrc(URL.createObjectURL(file));
  };

  const confirmCrop = (file: Blob) => {
    onChange({ type: "file", file, previewUrl: URL.createObjectURL(file) });
    closeCrop();
  };

  return (
    <FieldSet>
      <FieldLegend variant="label">Photo</FieldLegend>
      <div className="flex items-center gap-4">
        <ProfileAvatar displayName={displayName} avatarUrl={previewUrl} />
        <div className="flex flex-col items-start gap-1">
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}>
            Upload photo
          </Button>
          {accountPhotos.length === 1 && otherPhotos.length === 1 ? (
            <Button
              type="button"
              variant="ghost"
              disabled={disabled}
              onClick={() => onChange({ type: "provider", provider: otherPhotos[0].provider })}>
              Use account photo
            </Button>
          ) : null}
          {accountPhotos.length > 1 && otherPhotos.length > 0 ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="ghost" disabled={disabled}>
                  Use account photo
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {otherPhotos.map((photo) => (
                  <DropdownMenuItem
                    key={photo.provider}
                    onSelect={() => onChange({ type: "provider", provider: photo.provider })}>
                    {photo.label} photo
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
          {previewUrl ? (
            <Button
              type="button"
              variant="ghost"
              disabled={disabled}
              onClick={() => onChange({ type: "none" })}>
              Remove photo
            </Button>
          ) : null}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES}
        className="hidden"
        tabIndex={-1}
        aria-hidden="true"
        onChange={selectFile}
      />
      <AvatarCropDialog src={cropSrc} onCancel={closeCrop} onConfirm={confirmCrop} />
    </FieldSet>
  );
}
