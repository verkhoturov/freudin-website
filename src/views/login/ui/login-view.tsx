"use client";

import { CircleAlertIcon } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { getAuthErrorMessage, useViewerRedirect } from "@/entities/viewer";
import { routes } from "@/shared/config";
import { getSafeRedirectPath } from "@/shared/lib/safe-redirect";
import { Alert, AlertTitle } from "@/shared/ui/alert";
import { Container } from "@/shared/ui/container";
import { SignInPanel } from "@/widgets/sign-in-panel";

function SignInWithParams() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const nextParam = searchParams.get("next");
  const next = nextParam ? getSafeRedirectPath(nextParam) : undefined;
  // Вошедшего пользователя уводим со страницы входа
  useViewerRedirect("guest", next);

  return (
    <>
      {error ? (
        <Alert variant="destructive">
          <CircleAlertIcon />
          <AlertTitle>{getAuthErrorMessage(error)}</AlertTitle>
        </Alert>
      ) : null}
      <SignInPanel next={next} />
    </>
  );
}

export function LoginView() {
  return (
    <Container className="flex max-w-sm flex-col gap-6 py-10">
      <h1 className="font-semibold text-2xl tracking-tight">Sign in</h1>
      {/* useSearchParams на статической странице работает только внутри Suspense */}
      <Suspense fallback={<SignInPanel />}>
        <SignInWithParams />
      </Suspense>
      <p className="text-muted-foreground text-sm">
        By continuing, you agree to our{" "}
        <Link href={routes.terms} className="underline underline-offset-4">
          Terms of Service
        </Link>{" "}
        and acknowledge our{" "}
        <Link href={routes.privacy} className="underline underline-offset-4">
          Privacy Policy
        </Link>
        .
      </p>
    </Container>
  );
}
