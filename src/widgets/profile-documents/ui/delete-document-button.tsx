"use client";

import { Trash2Icon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { ProfileDocument } from "@/entities/profile";
import { useDeleteDocumentMutation } from "@/entities/viewer";
import { ApiError } from "@/shared/api";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/ui/alert-dialog";
import { Button } from "@/shared/ui/button";

/** Удаление документа с подтверждением. */
export function DeleteDocumentButton({ profileDocument }: { profileDocument: ProfileDocument }) {
  const deleteDocument = useDeleteDocumentMutation();
  const [open, setOpen] = useState(false);
  const isPending = deleteDocument.isPending;

  const handleDelete = () => {
    deleteDocument.mutate(profileDocument.id, {
      onSuccess: () => {
        setOpen(false);
        toast.success("Document deleted");
      },
      onError: (error) => {
        setOpen(false);
        toast.error(
          error instanceof ApiError
            ? error.message
            : "Couldn’t delete the document. Please try again.",
        );
      },
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={(nextOpen) => !isPending && setOpen(nextOpen)}>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={`Delete “${profileDocument.title}”`}>
          <Trash2Icon aria-hidden="true" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete document?</AlertDialogTitle>
          <AlertDialogDescription>
            “{profileDocument.title}” will be removed from your page.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <Button variant="destructive" disabled={isPending} onClick={handleDelete}>
            {isPending ? "Deleting…" : "Delete"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
