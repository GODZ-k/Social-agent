import { AppError } from "@/utils/AppError"
import type { NextFunction, Request, Response } from "express"
import type { ZodType } from "zod"

type ValidationData = {
    body: Request["body"]
    query: Request["query"]
    params: Request["params"]
}

export const validateMiddleware = (schema: ZodType<ValidationData>) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse({
            body: req.body,
            query: req.query,
            params: req.params,
        })

        if (!result.success) {
            const message = result.error.issues
                .map((issue) => {
                    const path = issue.path.join(".")
                    return `${path} : ${issue.message}`
                })
                .join(", ")

            return next(new AppError(message, 400, "VALIDATION_ERROR"))
        }

        const data = result.data as ValidationData

        req.body = data.body
        req.query = data.query
        req.params = data.params

        next()
    }
}