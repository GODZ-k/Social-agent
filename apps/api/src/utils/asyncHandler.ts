import type { RequestHandler } from "express";

/** Sends a rejected promise to `next`, so an async handler's error reaches `errorMiddleware`. */
export const asyncHandler =
    (handler: RequestHandler): RequestHandler =>
    (req, res, next) => {
        const result = handler(req, res, next);
        Promise.resolve(result).catch(next);
    };
