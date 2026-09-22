import type { ErrorRequestHandler } from "express";
import { AppError } from "@/utils/AppError";

// Four parameters, even though two are unused: that arity is how Express tells an error
// handler from an ordinary middleware.
export const errorMiddleware: ErrorRequestHandler = (err, _req, res, _next) => {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            success: false,
            error: {
                code: err.code,
                message: err.message,
                ...(err.details && { details: err.details }),
            },
        });
    }

    // express.json() rejects a body it cannot parse with this type.
    if (err?.type === "entity.parse.failed") {
        return res.status(400).json({
            success: false,
            error: {
                code: "INVALID_JSON",
                message: "The request body is not valid JSON.",
            },
        });
    }

    // Unexpected: the details stay in the server log, never in the response.
    console.error(err);
    return res.status(500).json({
        success: false,
        error: {
            code: "INTERNAL_SERVER_ERROR",
            message: "Something went wrong",
        },
    });
};
