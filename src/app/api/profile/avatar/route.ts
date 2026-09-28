import {
  HttpError,
  jsonOk,
  NO_STORE_HEADERS,
  parseJsonBody,
  readImageUpload,
  requireUser,
  withErrorHandling,
} from "@/app/api/_lib";
import {
  AVATAR_MAX_BYTES,
  AVATAR_MAX_DIMENSION,
  type AvatarUpdateResult,
  type DetectedImage,
  fetchProviderAvatar,
  type PublicProfile,
  providerAvatarRequestSchema,
  removeProfileAvatar,
  setProfileAvatar,
} from "@/entities/profile/index.server";
import { getLinkedIdentities } from "@/entities/viewer/index.server";
import type { SupabaseServerClient } from "@/shared/api/index.server";

function readUploadedAvatar(request: Request): Promise<DetectedImage> {
  return readImageUpload(request, {
    maxBytes: AVATAR_MAX_BYTES,
    maxDimension: AVATAR_MAX_DIMENSION,
    noun: "photo",
  });
}

async function readProviderAvatar(
  request: Request,
  supabase: SupabaseServerClient,
): Promise<DetectedImage> {
  const { provider } = await parseJsonBody(request, providerAvatarRequestSchema);

  // Адрес фото берём только из данных привязанного способа входа, а не из запроса
  const identities = await getLinkedIdentities(supabase);
  const avatarUrl = provider
    ? identities.find((identity) => identity.provider === provider)?.avatarUrl
    : identities.find((identity) => identity.avatarUrl)?.avatarUrl;
  if (!avatarUrl) throw new HttpError(400, "bad_request", "Your account has no photo.");

  const image = await fetchProviderAvatar(avatarUrl);
  if (!image) {
    throw new HttpError(
      400,
      "bad_request",
      "Couldn’t get your account photo. Upload one from your device.",
    );
  }
  return image;
}

function toResponse(result: AvatarUpdateResult): Response {
  if (!result.ok) throw new HttpError(404, "not_found", "Create your page first.");
  return jsonOk<PublicProfile>(result.profile, { headers: NO_STORE_HEADERS });
}

/**
 * Новое фото профиля: файл в `multipart/form-data` (поле `file`)
 * или JSON `{ "source": "provider", "provider"?: "telegram" }` — копия фото из аккаунта
 * провайдера входа.
 */
export const POST = withErrorHandling(async (request) => {
  const { supabase, claims } = await requireUser();
  const isMultipart = request.headers.get("content-type")?.startsWith("multipart/form-data");
  const image = isMultipart
    ? await readUploadedAvatar(request)
    : await readProviderAvatar(request, supabase);

  return toResponse(await setProfileAvatar(supabase, claims.sub, image));
});

/** Удаление фото профиля. */
export const DELETE = withErrorHandling(async () => {
  const { supabase, claims } = await requireUser();
  return toResponse(await removeProfileAvatar(supabase, claims.sub));
});
