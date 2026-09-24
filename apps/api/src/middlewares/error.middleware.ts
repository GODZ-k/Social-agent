import type { ErrorRequestHandler, Response } from "express";
import { AppError, type ErrorDetail } from "@/utils/AppError";

// Four parameters, even though two are unused: that arity is how Express tells an error
// handler from an ordinary middleware.
export const errorMiddleware: ErrorRequestHandler = (err, _req, res, _next) => {
    if (err instanceof AppError) {
        return sendError(res, err.statusCode, err.code, err.message, err.details);
    }

    if (isBadJson(err)) {
        return sendError(res, 400, "INVALID_JSON", "The request body is not valid JSON.");
    }

    // Unexpected: the details stay in the server log, never in the response.
    console.error(err);
    return sendError(res, 500, "INTERNAL_SERVER_ERROR", "Something went wrong");
};

// express.json() rejects a body it cannot parse with this type.
function isBadJson(err: unknown): boolean {
    return (err as { type?: string } | undefined)?.type === "entity.parse.failed";
}

function sendError(res: Response, status: number, code: string | undefined, message: string, details?: ErrorDetail[]) {
    const error: { code?: string; message: string; details?: ErrorDetail[] } = { code, message };
    if (details) error.details = details;
    return res.status(status).json({ success: false, error });
}
