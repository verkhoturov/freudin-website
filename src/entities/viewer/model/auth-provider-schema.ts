import { z } from "zod";
import { authProviders } from "../config/auth-providers";

export const authProviderSchema = z.enum(authProviders);
