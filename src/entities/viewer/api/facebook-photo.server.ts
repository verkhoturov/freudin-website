import "server-only";
import { z } from "zod";
import { AVATAR_SIZE } from "@/entities/profile/@x/viewer";
import type { SupabaseServerClient } from "@/shared/api/index.server";

const GRAPH_PICTURE_URL = "https://graph.facebook.com/me/picture";

/**
 * Крупное фото Facebook в `user_metadata`. Общие `avatar_url` и `picture` перезаписывает вход через
 * другого провайдера, а этот ключ остаётся за Facebook. Пустая строка — фото у аккаунта нет.
 */
export const FACEBOOK_AVATAR_METADATA_KEY = "facebook_avatar_url";
const GRAPH_TIMEOUT_MS = 5000;

const pictureResponseSchema = z.object({
  data: z.object({ url: z.url(), is_silhouette: z.boolean().optional() }),
});

/**
 * Supabase сохраняет фото Facebook размером 50×50, а ссылку с другим размером Facebook не
 * принимает: она подписана. Сразу после входа, пока в сессии есть токен Facebook, просим
 * у Graph API фото `AVATAR_SIZE` и кладём его ссылку в `user_metadata` вместо маленькой.
 * Заглушку без фото убираем. Затем обновляем сессию: `/api/me` читает `user_metadata` из JWT.
 * Сбой не мешает входу — останется маленькое фото.
 */
export async function upgradeFacebookPhoto(
  supabase: SupabaseServerClient,
  providerToken: string,
): Promise<void> {
  try {
    const url = new URL(GRAPH_PICTURE_URL);
    url.search = new URLSearchParams({
      width: String(AVATAR_SIZE),
      height: String(AVATAR_SIZE),
      redirect: "false",
    }).toString();
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${providerToken}` },
      cache: "no-store",
      signal: AbortSignal.timeout(GRAPH_TIMEOUT_MS),
    });
    if (!response.ok) {
      const body = (await response.text()).replace(/\s+/g, " ");
      console.warn("Facebook photo request failed:", response.status, body);
      return;
    }

    const picture = pictureResponseSchema.safeParse(await response.json());
    if (!picture.success) {
      console.warn("Unexpected Facebook photo response:", z.prettifyError(picture.error));
      return;
    }
    const { url: photoUrl, is_silhouette: isSilhouette } = picture.data.data;
    // null удаляет ключ из user_metadata
    const photo = isSilhouette ? null : photoUrl;

    const { error } = await supabase.auth.updateUser({
      data: { avatar_url: photo, picture: photo, [FACEBOOK_AVATAR_METADATA_KEY]: photo ?? "" },
    });
    if (error) {
      console.warn("Couldn't save the Facebook photo:", error.message);
      return;
    }
    const refreshed = await supabase.auth.refreshSession();
    if (refreshed.error) console.warn("Couldn't refresh the session:", refreshed.error.message);
  } catch (error) {
    console.warn("Couldn't get a larger Facebook photo:", error);
  }
}
