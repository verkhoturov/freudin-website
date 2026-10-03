"use client";

import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import {
  PAGE_PASSWORD_MAX_LENGTH,
  pageAccessInputSchema,
  useUnlockPageMutation,
} from "@/entities/profile";
import { ApiError } from "@/shared/api";
import { toFieldErrors } from "@/shared/lib/field-errors";
import { Button } from "@/shared/ui/button";
import { Field, FieldError, FieldLabel } from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";
import { toast } from "@/shared/ui/sonner";
import { Spinner } from "@/shared/ui/spinner";

/** Пароль страницы: после верного сервер ставит cookie, и страница перерисовывается с профилем. */
export function PagePasswordForm({ username }: { username: string }) {
  const router = useRouter();
  const unlock = useUnlockPageMutation(username);

  const form = useForm({
    defaultValues: { password: "" },
    validators: { onSubmit: pageAccessInputSchema },
    onSubmit: async ({ value, formApi }) => {
      try {
        await unlock.mutateAsync(value);
        router.refresh();
      } catch (error) {
        const message = error instanceof ApiError ? error.fields?.password : undefined;
        if (!message) {
          toast.error("Couldn’t open the page. Please try again.");
          return;
        }
        formApi.setFieldMeta("password", (meta) => ({
          ...meta,
          errorMap: { ...meta.errorMap, onSubmit: message },
        }));
      }
    },
  });

  return (
    <form
      noValidate
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        void form.handleSubmit();
      }}>
      <form.Field name="password">
        {(field) => {
          const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
          return (
            <Field data-invalid={isInvalid}>
              <FieldLabel htmlFor="page-password">Password</FieldLabel>
              <Input
                id="page-password"
                name={field.name}
                type="password"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                aria-invalid={isInvalid}
                autoComplete="off"
                maxLength={PAGE_PASSWORD_MAX_LENGTH}
              />
              {isInvalid ? <FieldError errors={toFieldErrors(field.state.meta.errors)} /> : null}
            </Field>
          );
        }}
      </form.Field>
      <form.Subscribe selector={(state) => state.isSubmitting || state.isSubmitSuccessful}>
        {/* После успеха страница перерисовывается на сервере: кнопка ждёт её */}
        {(isPending) => (
          <Button type="submit" disabled={isPending} className="self-start">
            {isPending ? <Spinner /> : null}
            {isPending ? "Opening…" : "Open page"}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}
