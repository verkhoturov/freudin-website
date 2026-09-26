import {
  HttpError,
  jsonOk,
  NO_STORE_HEADERS,
  parseJsonBody,
  requireUser,
  withErrorHandling,
} from "@/app/api/_lib";
import {
  AVATAR_MAX_BYTES,
  type AvatarImage,
  type AvatarUpdateResult,
  detectAvatarImage,
  fetchProviderAvatar,
  getProfileSuggestions,
  type PublicProfile,
  providerAvatarRequestSchema,
  removeProfileAvatar,
  setProfileAvatar,
} from "@/entities/profile/index.server";

// Запас на заголовки частей multipart поверх самого файла
const MULTIPART_OVERHEAD_BYTES = 64 * 1024;

function tooLargeError(): HttpError {
  return new HttpError(413, "payload_too_large", "Фото должно быть не больше 2 МБ.");
}

async function readUploadedAvatar(request: Request): Promise<AvatarImage> {
  if (Number(request.headers.get("content-length")) > AVATAR_MAX_BYTES + MULTIPART_OVERHEAD_BYTES) {
    throw tooLargeError();
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    throw new HttpError(400, "bad_request", "Не удалось прочитать файл.");
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    throw new HttpError(400, "validation_error", "Выберите фото.", { file: "Выберите фото" });
  }
  if (file.size > AVATAR_MAX_BYTES) throw tooLargeError();

  const image = detectAvatarImage(new Uint8Array(await file.arrayBuffer()));
  if (!image) {
    const message = "Загрузите фото в формате JPEG, PNG или WebP.";
    throw new HttpError(400, "validation_error", message, { file: message });
  }
  return image;
}

async function readProviderAvatar(
  request: Request,
  metadata: Record<string, unknown> | undefined,
): Promise<AvatarImage> {
  await parseJsonBody(request, providerAvatarRequestSchema);

  // Адрес фото берём только из данных провайдера в сессии, а не из запроса
  const { avatarUrl } = getProfileSuggestions(metadata, null);
  if (!avatarUrl) throw new HttpError(400, "bad_request", "В аккаунте нет фото.");

  const image = await fetchProviderAvatar(avatarUrl);
  if (!image) {
    throw new HttpError(
      400,
      "bad_request",
      "Не удалось взять фото из аккаунта. Загрузите его с устройства.",
    );
  }
  return image;
}

function toResponse(result: AvatarUpdateResult): Response {
  if (!result.ok) throw new HttpError(404, "not_found", "Сначала создайте страницу.");
  return jsonOk<PublicProfile>(result.profile, { headers: NO_STORE_HEADERS });
}

/**
 * Новое фото профиля: файл в `multipart/form-data` (поле `file`)
 * или JSON `{ "source": "provider" }` — копия фото из аккаунта провайдера входа.
 */
export const POST = withErrorHandling(async (request) => {
  const { supabase, claims } = await requireUser();
  const isMultipart = request.headers.get("content-type")?.startsWith("multipart/form-data");
  const image = isMultipart
    ? await readUploadedAvatar(request)
    : await readProviderAvatar(request, claims.user_metadata);

  return toResponse(await setProfileAvatar(supabase, claims.sub, image));
});

/** Удаление фото профиля. */
export const DELETE = withErrorHandling(async () => {
  const { supabase, claims } = await requireUser();
  return toResponse(await removeProfileAvatar(supabase, claims.sub));
});
