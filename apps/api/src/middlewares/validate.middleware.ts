import type { RequestHandler } from "express";
import type { ZodError, ZodType } from "zod";
import { AppError, type ErrorDetail } from "@/utils/AppError";

/**
 * Checks the request against a schema shaped `{ body?, query?, params? }`, then replaces
 * `req.body` with the parsed value, so a controller only ever sees validated data.
 */
export function validateMiddleware(schema: ZodType): RequestHandler {
    return (req, _res, next) => {
        const result = schema.safeParse({ body: req.body, query: req.query, params: req.params });

        if (!result.success) {
            return next(new AppError("Some fields are invalid.", 400, "VALIDATION_ERROR", toFieldErrors(result.error)));
        }

        const parsed = result.data as { body?: unknown };
        if (parsed.body !== undefined) req.body = parsed.body;
        next();
    };
}

function toFieldErrors(error: ZodError): ErrorDetail[] {
    return error.issues.map((issue) => ({ path: fieldPath(issue.path), message: issue.message }));
}

// The leading "body" is dropped so a field reads "name", not "body.name".
function fieldPath(path: PropertyKey[]): string {
    const withoutBody = path[0] === "body" ? path.slice(1) : path;
    return withoutBody.join(".");
}
