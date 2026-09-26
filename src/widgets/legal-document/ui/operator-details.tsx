"use client";

import Link from "next/link";
import { legalConfig, routes, siteConfig } from "@/shared/config";
import { SupportEmailLink } from "@/shared/ui/support-email-link";

/** Реквизиты оператора сервиса для юридических текстов. */
export function OperatorDetails() {
  return (
    <address className="not-italic">
      <strong>{legalConfig.operatorName}</strong>
      <br />
      <strong>Identification number:</strong> {legalConfig.registrationNumber}
      <br />
      <strong>Country of registration:</strong> {legalConfig.registrationCountry}
      <br />
      <strong>Email:</strong> <SupportEmailLink />
      <br />
      <strong>Website:</strong> <Link href={routes.home}>{siteConfig.url}</Link>
    </address>
  );
}
