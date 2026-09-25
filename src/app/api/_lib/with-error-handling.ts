import { errorResponse } from "./responses";

type RouteHandler<Context> = (request: Request, context: Context) => Response | Promise<Response>;

/** Оборачивает route handler: HttpError превращается в ответ с её статусом, остальное — в 500. */
export function withErrorHandling<Context>(handler: RouteHandler<Context>): RouteHandler<Context> {
  return async (request, context) => {
    try {
      return await handler(request, context);
    } catch (error) {
      return errorResponse(error);
    }
  };
}
