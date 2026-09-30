"use client";

import { type FormEvent, useId, useRef, useState } from "react";
import { isAccountDeletionConfirmed, useDeleteAccountMutation } from "@/entities/viewer";
import { routes, siteConfig } from "@/shared/config";
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
import { Field, FieldLabel } from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";
import { toast } from "@/shared/ui/sonner";
import { Spinner } from "@/shared/ui/spinner";

const SITE_HOST = new URL(siteConfig.url).host;

/**
 * Удаление аккаунта: кнопка «Delete» активна, только когда введён username. У аккаунта без
 * страницы (`username` — `null`, онбординг) подтверждать нечего. После удаления страница
 * полностью перезагружается на главную: так сбрасываются кеш запросов и состояние пользователя.
 */
export function DeleteAccountDialog({ username }: { username: string | null }) {
  const deleteAccount = useDeleteAccountMutation();
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const isConfirmed = username === null || isAccountDeletionConfirmed(confirmation, username);
  // После успеха страница перезагружается: до этого повторный запрос не нужен
  const isBusy = deleteAccount.isPending || deleteAccount.isSuccess;

  const handleOpenChange = (nextOpen: boolean) => {
    if (isBusy) return;
    setOpen(nextOpen);
    if (!nextOpen) setConfirmation("");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isConfirmed || isBusy) return;
    deleteAccount.mutate(username === null ? {} : { username: confirmation }, {
      onSuccess: () => window.location.assign(routes.home),
      onError: () => toast.error("Couldn’t delete your account. Please try again."),
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Delete account</Button>
      </AlertDialogTrigger>
      <AlertDialogContent
        onOpenAutoFocus={(event) => {
          // По умолчанию фокус получает «Cancel», а здесь сразу вводят username
          if (!inputRef.current) return;
          event.preventDefault();
          inputRef.current.focus();
        }}>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete account?</AlertDialogTitle>
            <AlertDialogDescription>
              {username === null
                ? "Your account and sign-in details will be deleted permanently."
                : `Your page ${SITE_HOST}/${username}, photo, documents, and links will be deleted permanently.`}{" "}
              This can’t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {username === null ? null : (
            <Field>
              <FieldLabel htmlFor={inputId}>
                <span>
                  Type <span className="break-all font-semibold">{username}</span> to confirm
                </span>
              </FieldLabel>
              <Input
                ref={inputRef}
                id={inputId}
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                disabled={isBusy}
                autoComplete="off"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
              />
            </Field>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isBusy}>Cancel</AlertDialogCancel>
            <Button type="submit" variant="destructive" disabled={!isConfirmed || isBusy}>
              {isBusy ? <Spinner /> : null}
              {isBusy ? "Deleting…" : "Delete"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
