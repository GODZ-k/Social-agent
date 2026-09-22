import type { RequestHandler } from "express";
import type { ZodType } from "zod";
import { AppError } from "@/utils/AppError";

/**
 * Checks the request against a schema shaped `{ body?, query?, params? }`, then replaces
 * `req.body` with the parsed value, so a controller only ever sees validated data.
 */
export function validateMiddleware(schema: ZodType): RequestHandler {
    return (req, _res, next) => {
        const result = schema.safeParse({
            body: req.body,
            query: req.query,
            params: req.params,
        });

        if (!result.success) {
            // The leading "body" is dropped so a field reads "name", not "body.name".
            const details = result.error.issues.map((issue) => ({
                path: (issue.path[0] === "body" ? issue.path.slice(1) : issue.path).join("."),
                message: issue.message,
            }));

            return next(new AppError("Some fields are invalid.", 400, "VALIDATION_ERROR", details));
        }

        const data = result.data as { body?: unknown };
        if (data.body !== undefined) req.body = data.body;

        next();
    };
}
