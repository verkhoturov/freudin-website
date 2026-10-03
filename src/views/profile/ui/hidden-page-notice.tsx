"use client";

import type { ProfileVisibility } from "@/entities/profile";
import { Container } from "@/shared/ui/container";
import { PagePasswordForm } from "./page-password-form";

type HiddenPageNoticeProps = {
  username: string;
  visibility: Exclude<ProfileVisibility, "public">;
};

/** Что гость видит вместо скрытой страницы: сообщение или форму пароля, без имени и фото. */
export function HiddenPageNotice({ username, visibility }: HiddenPageNoticeProps) {
  return (
    <Container width="sign-in" className="flex flex-col gap-6 py-page">
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-page-title">
          {visibility === "private" ? "Hidden page" : "Protected page"}
        </h1>
        <p className="text-muted-foreground">
          {visibility === "private"
            ? "The author has hidden this page."
            : "The author has protected this page with a password."}
        </p>
      </div>
      {visibility === "password" ? <PagePasswordForm username={username} /> : null}
    </Container>
  );
}
