"use client";

import { CircleAlertIcon } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { getAuthErrorMessage } from "@/entities/viewer";
import { routes } from "@/shared/config";
import { getSafeRedirectPath } from "@/shared/lib/safe-redirect";
import { Alert, AlertTitle } from "@/shared/ui/alert";
import { Container } from "@/shared/ui/container";
import { SignInPanel } from "@/widgets/sign-in-panel";

function SignInWithParams() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const next = searchParams.get("next");

  return (
    <>
      {error ? (
        <Alert variant="destructive">
          <CircleAlertIcon />
          <AlertTitle>{getAuthErrorMessage(error)}</AlertTitle>
        </Alert>
      ) : null}
      <SignInPanel next={next ? getSafeRedirectPath(next) : undefined} />
    </>
  );
}

export function LoginView() {
  return (
    <Container className="flex max-w-sm flex-col gap-6 py-10">
      <h1 className="font-semibold text-2xl tracking-tight">Вход</h1>
      {/* useSearchParams на статической странице работает только внутри Suspense */}
      <Suspense fallback={<SignInPanel />}>
        <SignInWithParams />
      </Suspense>
      <p className="text-muted-foreground text-sm">
        Продолжая, вы принимаете{" "}
        <Link href={routes.terms} className="underline underline-offset-4">
          условия использования
        </Link>{" "}
        и{" "}
        <Link href={routes.privacy} className="underline underline-offset-4">
          политику конфиденциальности
        </Link>
        .
      </p>
    </Container>
  );
}
