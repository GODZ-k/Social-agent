import { AppError } from "@/utils/AppError"
import type { NextFunction, Request, Response } from "express"
import type { ZodType } from "zod"


export const validateMiddleware = (schema: ZodType) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse({
            body: req.body,
            query: req.query,
            params: req.params,
        })

        if (!result.success) {
            const details = result.error.issues.map((issue) => ({
                path: (issue.path[0] === "body" ? issue.path.slice(1) : issue.path).join("."),
                message: issue.message,
            }))

            return next(new AppError("Some fields are invalid.", 400, "VALIDATION_ERROR", details))
        }

        const data = result.data as { body?: unknown }
        if (data.body !== undefined) req.body = data.body

        next()
    }
}
