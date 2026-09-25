import { HttpError, jsonOk, withErrorHandling } from "@/app/api/_lib";
import { DEMO_USERNAME, type PublicProfile } from "@/entities/profile/index.server";
import { siteConfig } from "@/shared/config";

// Заглушка до базы данных (шаг 11 плана): отдаёт только демо-профиль.
const demoProfile: PublicProfile = {
  username: DEMO_USERNAME,
  displayName: "Демо-профиль",
  bio: "Так выглядит личная страница: фото, имя, описание и ссылки на соцсети.",
  avatarUrl: null,
  socialLinks: [
    { platform: "telegram", url: "https://t.me/telegram" },
    { platform: "instagram", url: "https://www.instagram.com/instagram" },
    { platform: "website", url: `${siteConfig.url}/` },
  ],
};

export const GET = withErrorHandling(
  async (_request, { params }: RouteContext<"/api/profiles/[username]">) => {
    const { username } = await params;
    if (username.toLowerCase() !== DEMO_USERNAME) {
      throw new HttpError(404, "not_found", "Страница не найдена.");
    }
    return jsonOk(demoProfile);
  },
);
