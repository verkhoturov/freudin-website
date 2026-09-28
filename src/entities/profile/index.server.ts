import "server-only";

export {
  type AvatarUpdateResult,
  fetchProviderAvatar,
  removeProfileAvatar,
  removeUserAvatarFiles,
  setProfileAvatar,
} from "./api/avatar.server";
export { getContactEmail } from "./api/contact-email.server";
export {
  addProfileDocument,
  type DocumentImages,
  type DocumentUpdateResult,
  removeProfileDocument,
  removeUserDocumentFiles,
} from "./api/document.server";
export {
  type CreateProfileResult,
  createProfile,
  getProfileByUserId,
  getProfileByUsername,
  isUsernameAvailable,
  type UpdateProfileResult,
  updateProfile,
} from "./api/profile.server";
export { DOCUMENTS_MAX } from "./config/limits";
export {
  AVATAR_MAX_BYTES,
  AVATAR_MAX_DIMENSION,
  DOCUMENT_MAX_BYTES,
  DOCUMENT_MAX_DIMENSION,
  DOCUMENT_THUMBNAIL_MAX_BYTES,
  DOCUMENT_THUMBNAIL_SIZE,
} from "./config/storage";
export { type DetectedImage, detectImage } from "./lib/detect-image";
export { getProfileSuggestions, type ProfileSuggestions } from "./lib/get-profile-suggestions";
export {
  documentTitleSchema,
  type ProfileData,
  type ProfileUpdateData,
  profileInputSchema,
  profileUpdateSchema,
  providerAvatarRequestSchema,
} from "./model/schemas";
export type { PublicProfile, UsernameAvailability } from "./model/types";
export { usernameSchema } from "./model/username";
