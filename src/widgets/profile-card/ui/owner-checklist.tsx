"use client";

import { CheckIcon, CircleIcon, XIcon } from "lucide-react";
import Link from "next/link";
import type { PublicProfile } from "@/entities/profile";
import { routes } from "@/shared/config";
import { Button } from "@/shared/ui/button";
import { useChecklistStore } from "../model/checklist-store";
import { ShareProfileButton } from "./share-profile-button";

type ChecklistItem = { id: string; label: string; href: string; done: boolean };

function getChecklistItems(profile: PublicProfile): ChecklistItem[] {
  const hasContact = Object.keys(profile.contacts).length > 0 || profile.socialLinks.length > 0;
  return [
    { id: "photo", label: "Add a photo", href: routes.settings, done: Boolean(profile.avatarUrl) },
    {
      id: "contact",
      label: "Add a way to contact you",
      href: routes.settingsBlock("contacts"),
      done: hasContact,
    },
    {
      id: "main-button",
      label: "Choose your main contact button",
      href: routes.settingsBlock("contacts"),
      done: Boolean(profile.preferredContact),
    },
    {
      id: "format-price",
      label: "Add your work format and price",
      href: routes.settingsBlock("work-formats"),
      done: profile.workFormats.length > 0 && profile.price !== null,
    },
  ];
}

/**
 * Подсказки владельцу, что ещё заполнить на странице: пункты считаются по текущему профилю
 * и ведут к нужному блоку настроек. Пропадают, когда всё заполнено или владелец их скрыл.
 * Посетители их не видят.
 */
export function OwnerChecklist({ profile }: { profile: PublicProfile }) {
  const isDismissed = useChecklistStore((state) => state.dismissed.includes(profile.username));
  const dismiss = useChecklistStore((state) => state.dismiss);
  const items = getChecklistItems(profile);
  if (isDismissed || items.every((item) => item.done)) return null;

  return (
    <section
      aria-labelledby="owner-checklist-title"
      className="flex w-full flex-col gap-3 rounded-xl border p-4 text-left">
      <div className="flex items-start gap-2">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h2 id="owner-checklist-title" className="font-medium">
            Finish your page
          </h2>
          <p className="text-muted-foreground text-sm">Only you can see this.</p>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Hide these tips"
          onClick={() => dismiss(profile.username)}>
          <XIcon aria-hidden="true" />
        </Button>
      </div>
      <ul className="flex flex-col gap-2 text-sm">
        {items.map((item) => (
          <li key={item.id} className="flex items-center gap-2">
            {item.done ? (
              <>
                <CheckIcon aria-hidden="true" className="size-4 shrink-0 text-primary" />
                <span className="text-muted-foreground">
                  {item.label}
                  <span className="sr-only"> (done)</span>
                </span>
              </>
            ) : (
              <>
                <CircleIcon aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
                <Link href={item.href} className="text-link underline underline-offset-4">
                  {item.label}
                </Link>
              </>
            )}
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap items-center gap-x-2 text-sm">
        <span>Then share your link or QR code:</span>
        <ShareProfileButton username={profile.username} displayName={profile.displayName} />
      </div>
    </section>
  );
}
