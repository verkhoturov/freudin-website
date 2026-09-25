import { jsonOk, withErrorHandling } from "@/app/api/_lib";

export const GET = withErrorHandling(() => jsonOk({ status: "ok" }));
