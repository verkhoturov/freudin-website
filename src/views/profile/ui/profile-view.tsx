"use client";

import { useParams } from "next/navigation";
import { PagePlaceholder } from "@/shared/ui/page-placeholder";

export function ProfileView() {
  const { username } = useParams<{ username: string }>();

  return (
    <PagePlaceholder
      title={`@${username}`}
      description="Здесь будет личная страница: фото, имя, описание и ссылки на соцсети."
    />
  );
}
