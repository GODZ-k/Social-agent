import { AppError } from "@/utils/AppError";
import type { Request, Response } from "express";

export class HealthController {
    static async healthCheck(req: Request, res: Response) {
        res.status(200).json({
            success: true,
            data: {
                status: "healthy",
                timestamp: new Date().toISOString(),
            },
        });
    }
    static async testError(req: Request, res: Response) {
        throw new AppError(
            "This is a test error",
            400,
            "TEST_ERROR"
        );
    }
}