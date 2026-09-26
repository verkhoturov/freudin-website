import {
  HttpError,
  jsonOk,
  NO_STORE_HEADERS,
  parseJsonBody,
  requireUser,
  withErrorHandling,
} from "@/app/api/_lib";
import {
  createProfile,
  type PublicProfile,
  profileInputSchema,
  profileUpdateSchema,
  updateProfile,
} from "@/entities/profile/index.server";

const USERNAME_TAKEN_MESSAGE = "Этот адрес уже занят.";

function usernameTakenError(): HttpError {
  return new HttpError(409, "conflict", USERNAME_TAKEN_MESSAGE, {
    username: USERNAME_TAKEN_MESSAGE,
  });
}

/** Создание профиля на онбординге. */
export const POST = withErrorHandling(async (request) => {
  const { supabase, claims } = await requireUser();
  const data = await parseJsonBody(request, profileInputSchema);
  const result = await createProfile(supabase, claims.sub, data);

  if (!result.ok) {
    if (result.reason === "username_taken") throw usernameTakenError();
    throw new HttpError(409, "conflict", "Страница уже создана.");
  }
  return jsonOk<PublicProfile>(result.profile, { status: 201, headers: NO_STORE_HEADERS });
});

/** Обновление профиля: только переданные поля. */
export const PATCH = withErrorHandling(async (request) => {
  const { supabase, claims } = await requireUser();
  const data = await parseJsonBody(request, profileUpdateSchema);
  const result = await updateProfile(supabase, claims.sub, data);

  if (!result.ok) {
    if (result.reason === "username_taken") throw usernameTakenError();
    throw new HttpError(404, "not_found", "Сначала создайте страницу.");
  }
  return jsonOk<PublicProfile>(result.profile, { headers: NO_STORE_HEADERS });
});
