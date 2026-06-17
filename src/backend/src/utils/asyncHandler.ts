import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Wraps async route handlers to forward errors to Express error middleware.
 * Eliminates the need for try/catch in every route.
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
