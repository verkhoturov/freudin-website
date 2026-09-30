"use client";

import { useForm, useStore } from "@tanstack/react-form";
import { PlusIcon } from "lucide-react";
import { type ChangeEvent, useEffect, useRef, useState } from "react";
import * as z from "zod";
import { DOCUMENT_TITLE_MAX_LENGTH, documentTitleSchema } from "@/entities/profile";
import { useUploadDocumentMutation } from "@/entities/viewer";
import { ApiError } from "@/shared/api";
import { toFieldErrors } from "@/shared/lib/field-errors";
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
import { Field, FieldError, FieldGroup, FieldLabel } from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";
import { toast } from "@/shared/ui/sonner";
import { Spinner } from "@/shared/ui/spinner";
import { type DocumentImages, prepareDocumentImages } from "../lib/prepare-document-images";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
// Исходник до уменьшения: большие сканы браузер ещё открывает, дальше — вряд ли
const SOURCE_MAX_BYTES = 30 * 1024 * 1024;

const documentFormSchema = z.object({ title: documentTitleSchema });

type PreparedDocument = DocumentImages & { previewUrl: string };

/** Загрузка документа: выбор изображения, подпись и отправка. */
export function AddDocumentDialog() {
  const uploadDocument = useUploadDocumentMutation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [prepared, setPrepared] = useState<PreparedDocument | null>(null);
  const [isPreparing, setIsPreparing] = useState(false);

  // Превью — object URL: освобождаем, когда картинка сменилась
  useEffect(() => {
    if (!prepared) return;
    const { previewUrl } = prepared;
    return () => URL.revokeObjectURL(previewUrl);
  }, [prepared]);

  const form = useForm({
    defaultValues: { title: "" },
    validators: { onChange: documentFormSchema },
    onSubmit: async ({ value, formApi }) => {
      if (!prepared) return;
      try {
        await uploadDocument.mutateAsync({
          file: prepared.file.blob,
          thumbnail: prepared.thumbnail.blob,
          title: value.title,
        });
        toast.success("Document added");
        setOpen(false);
      } catch (error) {
        const titleError = error instanceof ApiError ? error.fields?.title : undefined;
        if (titleError) {
          formApi.setFieldMeta("title", (meta) => ({
            ...meta,
            errorMap: { ...meta.errorMap, onSubmit: titleError },
          }));
          return;
        }
        toast.error(
          error instanceof ApiError
            ? error.message
            : "Couldn’t upload the document. Please try again.",
        );
      }
    },
  });
  const isSubmitting = useStore(form.store, (state) => state.isSubmitting);

  const handleOpenChange = (nextOpen: boolean) => {
    if (isSubmitting) return;
    // Каждый раз начинаем с чистой формы
    if (nextOpen) {
      form.reset();
      setPrepared(null);
    }
    setOpen(nextOpen);
  };

  const selectFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Сбрасываем, чтобы тот же файл можно было выбрать ещё раз
    event.target.value = "";
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error("Choose a JPEG, PNG, or WebP image.");
      return;
    }
    if (file.size > SOURCE_MAX_BYTES) {
      toast.error("The file is too large. Choose a smaller image.");
      return;
    }

    setIsPreparing(true);
    try {
      const images = await prepareDocumentImages(file);
      setPrepared({ ...images, previewUrl: URL.createObjectURL(images.thumbnail.blob) });
    } catch {
      toast.error("Couldn’t open the image. Try another file.");
    } finally {
      setIsPreparing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" className="self-start">
          <PlusIcon aria-hidden="true" />
          Add document
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form
          noValidate
          className="grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            // Диалог стоит внутри формы профиля: в React submit всплывает через портал до неё
            event.stopPropagation();
            void form.handleSubmit();
          }}>
          <DialogHeader>
            <DialogTitle>Add document</DialogTitle>
            <DialogDescription>
              Everyone who visits your page will see it. Before uploading, cover ID numbers and
              other details you don’t want to share.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <div className="flex flex-col items-start gap-3">
              {prepared ? (
                // biome-ignore lint/performance/noImgElement: превью — object URL выбранного файла, next/image его не оптимизирует
                <img
                  src={prepared.previewUrl}
                  alt="Preview of the selected document"
                  width={prepared.thumbnail.width}
                  height={prepared.thumbnail.height}
                  className="h-auto max-h-48 w-auto max-w-full rounded-md border object-contain"
                />
              ) : null}
              <Button
                type="button"
                variant="outline"
                disabled={isPreparing || isSubmitting}
                onClick={() => inputRef.current?.click()}>
                {isPreparing ? <Spinner /> : null}
                {isPreparing ? "Preparing…" : prepared ? "Choose another image" : "Choose image"}
              </Button>
              <input
                ref={inputRef}
                type="file"
                accept={ACCEPTED_TYPES.join(",")}
                className="hidden"
                tabIndex={-1}
                aria-hidden="true"
                onChange={(event) => void selectFile(event)}
              />
            </div>
            <form.Field name="title">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor="document-title">Caption</FieldLabel>
                    <Input
                      id="document-title"
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="MA in Clinical Psychology, Tbilisi State University"
                      maxLength={DOCUMENT_TITLE_MAX_LENGTH}
                      disabled={isSubmitting}
                    />
                    {isInvalid ? (
                      <FieldError errors={toFieldErrors(field.state.meta.errors)} />
                    ) : null}
                  </Field>
                );
              }}
            </form.Field>
          </FieldGroup>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!prepared || isPreparing || isSubmitting}>
              {isSubmitting ? <Spinner /> : null}
              {isSubmitting ? "Uploading…" : "Upload"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
