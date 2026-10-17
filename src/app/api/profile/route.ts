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
  type SavedProfile,
  updateProfile,
} from "@/entities/profile/index.server";

const USERNAME_TAKEN_MESSAGE = "This username is already taken.";

const CITY_INVALID_MESSAGE = "Choose a city from the list";

const PAGE_PASSWORD_REQUIRED_MESSAGE = "Set a password for your page";

const VERSION_CONFLICT_MESSAGE =
  "Your page was updated in another tab. Reload the page to get the latest version.";

function pagePasswordRequiredError(): HttpError {
  return new HttpError(400, "validation_error", `${PAGE_PASSWORD_REQUIRED_MESSAGE}.`, {
    pagePassword: PAGE_PASSWORD_REQUIRED_MESSAGE,
  });
}

function usernameTakenError(): HttpError {
  return new HttpError(409, "conflict", USERNAME_TAKEN_MESSAGE, {
    username: USERNAME_TAKEN_MESSAGE,
  });
}

// Города нет в справочнике или он из другой страны
function cityInvalidError(): HttpError {
  return new HttpError(400, "validation_error", `${CITY_INVALID_MESSAGE}.`, {
    cityId: CITY_INVALID_MESSAGE,
  });
}

/** Создание профиля на онбординге. */
export const POST = withErrorHandling(async (request) => {
  const { supabase, claims } = await requireUser();
  const data = await parseJsonBody(request, profileInputSchema);
  const result = await createProfile(supabase, claims.sub, data);

  if (!result.ok) {
    if (result.reason === "username_taken") throw usernameTakenError();
    if (result.reason === "city_invalid") throw cityInvalidError();
    throw new HttpError(409, "conflict", "Your page has already been created.");
  }
  return jsonOk<PublicProfile>(result.profile, { status: 201, headers: NO_STORE_HEADERS });
});

/**
 * Обновление профиля: только переданные поля, все вместе или ничего. Профиль сохранили
 * после открытия формы (другая вкладка) — 409 `version_conflict`.
 */
export const PATCH = withErrorHandling(async (request) => {
  const { supabase, claims } = await requireUser();
  const { expectedVersion, ...data } = await parseJsonBody(request, profileUpdateSchema);
  const result = await updateProfile(supabase, claims.sub, data, expectedVersion);

  if (!result.ok) {
    if (result.reason === "username_taken") throw usernameTakenError();
    if (result.reason === "city_invalid") throw cityInvalidError();
    if (result.reason === "page_password_required") throw pagePasswordRequiredError();
    if (result.reason === "version_conflict") {
      throw new HttpError(409, "version_conflict", VERSION_CONFLICT_MESSAGE);
    }
    throw new HttpError(404, "not_found", "Create your page first.");
  }
  return jsonOk<SavedProfile>(result.saved, { headers: NO_STORE_HEADERS });
});
