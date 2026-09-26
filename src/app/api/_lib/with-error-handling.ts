import { errorResponse } from "./responses";
import { assertSameOrigin } from "./same-origin";

type RouteHandler<Context> = (request: Request, context: Context) => Response | Promise<Response>;

/**
 * Оборачивает route handler: изменяющий запрос с чужого сайта отклоняет с 403, HttpError
 * превращает в ответ с её статусом, остальное — в 500.
 */
export function withErrorHandling<Context>(handler: RouteHandler<Context>): RouteHandler<Context> {
  return async (request, context) => {
    try {
      assertSameOrigin(request);
      return await handler(request, context);
    } catch (error) {
      return errorResponse(error);
    }
  };
}
