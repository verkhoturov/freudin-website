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

const USERNAME_TAKEN_MESSAGE = "This username is already taken.";

const CITY_INVALID_MESSAGE = "Choose a city from the list";

const PAGE_PASSWORD_REQUIRED_MESSAGE = "Set a password for your page";

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

/** Обновление профиля: только переданные поля. */
export const PATCH = withErrorHandling(async (request) => {
  const { supabase, claims } = await requireUser();
  const data = await parseJsonBody(request, profileUpdateSchema);
  const result = await updateProfile(supabase, claims.sub, data);

  if (!result.ok) {
    if (result.reason === "username_taken") throw usernameTakenError();
    if (result.reason === "city_invalid") throw cityInvalidError();
    if (result.reason === "page_password_required") throw pagePasswordRequiredError();
    throw new HttpError(404, "not_found", "Create your page first.");
  }
  return jsonOk<PublicProfile>(result.profile, { headers: NO_STORE_HEADERS });
});
