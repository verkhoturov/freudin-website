"use client";

import { type ChangeEvent, useRef, useState } from "react";
import { toast } from "sonner";
import { ProfileAvatar } from "@/entities/profile";
import { Button } from "@/shared/ui/button";
import { FieldLegend, FieldSet } from "@/shared/ui/field";
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
  /** Фото из аккаунта провайдера входа. */
  providerAvatarUrl: string | null;
  disabled?: boolean;
};

function getPreviewUrl(
  value: AvatarValue,
  currentAvatarUrl: string | null,
  providerAvatarUrl: string | null,
): string | null {
  switch (value.type) {
    case "current":
      return currentAvatarUrl;
    case "provider":
      return providerAvatarUrl;
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
  providerAvatarUrl,
  disabled,
}: AvatarFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const previewUrl = getPreviewUrl(value, currentAvatarUrl, providerAvatarUrl);

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
      toast.error("Выберите фото в формате JPEG, PNG или WebP.");
      return;
    }
    if (file.size > SOURCE_MAX_BYTES) {
      toast.error("Файл слишком большой. Выберите фото поменьше.");
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
      <FieldLegend variant="label">Фото</FieldLegend>
      <div className="flex items-center gap-4">
        <ProfileAvatar displayName={displayName} avatarUrl={previewUrl} />
        <div className="flex flex-col items-start gap-1">
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}>
            Загрузить фото
          </Button>
          {providerAvatarUrl && value.type !== "provider" ? (
            <Button
              type="button"
              variant="ghost"
              disabled={disabled}
              onClick={() => onChange({ type: "provider" })}>
              Взять фото из аккаунта
            </Button>
          ) : null}
          {previewUrl ? (
            <Button
              type="button"
              variant="ghost"
              disabled={disabled}
              onClick={() => onChange({ type: "none" })}>
              Убрать фото
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
