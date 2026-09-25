import { jsonOk, withErrorHandling } from "@/app/api/_lib";
import type { HealthResponse } from "@/shared/api";

export const GET = withErrorHandling(() => jsonOk<HealthResponse>({ status: "ok" }));
