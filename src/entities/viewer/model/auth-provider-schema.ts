import * as z from "zod";
import { authProviders } from "../config/auth-providers";

export const authProviderSchema = z.enum(authProviders);

/** Тело `POST /api/auth/identities`: какой способ входа привязать. */
export const identityLinkInputSchema = z.object({ provider: authProviderSchema });

export type IdentityLinkInput = z.infer<typeof identityLinkInputSchema>;
