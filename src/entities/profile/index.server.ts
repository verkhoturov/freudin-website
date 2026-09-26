import "server-only";

export {
  type AvatarImage,
  type AvatarUpdateResult,
  detectAvatarImage,
  fetchProviderAvatar,
  removeProfileAvatar,
  removeUserAvatarFiles,
  setProfileAvatar,
} from "./api/avatar.server";
export {
  type CreateProfileResult,
  createProfile,
  getProfileByUserId,
  getProfileByUsername,
  isUsernameAvailable,
  type UpdateProfileResult,
  updateProfile,
} from "./api/profile.server";
export { AVATAR_MAX_BYTES } from "./config/storage";
export { getProfileSuggestions, type ProfileSuggestions } from "./lib/get-profile-suggestions";
export {
  type ProfileData,
  type ProfileUpdateData,
  profileInputSchema,
  profileUpdateSchema,
  providerAvatarRequestSchema,
} from "./model/schemas";
export type { PublicProfile, UsernameAvailability } from "./model/types";
export { usernameSchema } from "./model/username";
