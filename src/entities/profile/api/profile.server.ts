import "server-only";
import { type SocialLink, socialLinkSchema } from "@/entities/social-link/@x/profile";
import type { Json, SupabaseServerClient, Tables } from "@/shared/api/index.server";
import { AVATARS_BUCKET } from "../config/storage";
import type { PublicProfile } from "../model/types";

const PUBLIC_PROFILE_COLUMNS = "username, display_name, bio, avatar_path, social_links";

type PublicProfileRow = Pick<
  Tables<"profiles">,
  "username" | "display_name" | "bio" | "avatar_path" | "social_links"
>;

// Ссылки в БД уже нормализованы; невалидные (например, платформу убрали из справочника) пропускаем
function parseSocialLinks(value: Json): SocialLink[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    const link = socialLinkSchema.safeParse(item);
    return link.success ? [link.data] : [];
  });
}

function toPublicProfile(supabase: SupabaseServerClient, row: PublicProfileRow): PublicProfile {
  return {
    username: row.username,
    displayName: row.display_name,
    bio: row.bio,
    avatarUrl: row.avatar_path
      ? supabase.storage.from(AVATARS_BUCKET).getPublicUrl(row.avatar_path).data.publicUrl
      : null,
    socialLinks: parseSocialLinks(row.social_links),
  };
}

/** Профиль пользователя или `null`, если он ещё не прошёл онбординг. */
export async function getProfileByUserId(
  supabase: SupabaseServerClient,
  userId: string,
): Promise<PublicProfile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select(PUBLIC_PROFILE_COLUMNS)
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  return data ? toPublicProfile(supabase, data) : null;
}
