import {
  HttpError,
  jsonOk,
  NO_STORE_HEADERS,
  readImageField,
  readMultipart,
  requireUser,
  withErrorHandling,
} from "@/app/api/_lib";
import {
  addProfileDocument,
  DOCUMENT_MAX_BYTES,
  DOCUMENT_MAX_DIMENSION,
  DOCUMENT_THUMBNAIL_MAX_BYTES,
  DOCUMENT_THUMBNAIL_SIZE,
  DOCUMENTS_MAX,
  documentTitleSchema,
  type PublicProfile,
} from "@/entities/profile/index.server";

/**
 * Новый документ психолога, `multipart/form-data`: изображение в поле `file` (JPEG, PNG или
 * WebP до 2 МБ и 2048×2048), превью в поле `thumbnail` (до 256 КБ и 480×480) и подпись
 * в поле `title`. Ответ — обновлённый профиль, 201.
 */
export const POST = withErrorHandling(async (request) => {
  const { supabase, claims } = await requireUser();
  const formData = await readMultipart(request, DOCUMENT_MAX_BYTES + DOCUMENT_THUMBNAIL_MAX_BYTES);

  const title = documentTitleSchema.safeParse(formData.get("title"));
  if (!title.success) {
    const message = title.error.issues[0]?.message ?? "Enter a caption";
    throw new HttpError(400, "validation_error", `${message}.`, { title: message });
  }
  const image = await readImageField(formData, {
    field: "file",
    maxBytes: DOCUMENT_MAX_BYTES,
    maxDimension: DOCUMENT_MAX_DIMENSION,
    noun: "image",
  });
  const thumbnail = await readImageField(formData, {
    field: "thumbnail",
    maxBytes: DOCUMENT_THUMBNAIL_MAX_BYTES,
    maxDimension: DOCUMENT_THUMBNAIL_SIZE,
    noun: "preview",
  });

  const result = await addProfileDocument(supabase, claims.sub, { image, thumbnail }, title.data);
  if (!result.ok) {
    if (result.reason === "limit_reached") {
      throw new HttpError(409, "conflict", `You can upload up to ${DOCUMENTS_MAX} documents.`);
    }
    throw new HttpError(404, "not_found", "Create your page first.");
  }
  return jsonOk<PublicProfile>(result.profile, { status: 201, headers: NO_STORE_HEADERS });
});
