import { HealthService } from "@/services/health.service";
import { AppError } from "@/utils/AppError";
import type { Request, Response } from "express";

export class HealthController {
    static async healthCheck(req: Request, res: Response) {
        const report = await HealthService.check();
        const isHealthy = report.status === "healthy";

        return res.status(isHealthy ? 200 : 503).json({
            success: isHealthy,
            data: report,
        });
    }
    static async testError(req: Request, res: Response): Promise<never> {
        throw new AppError(
            "This is a test error",
            400,
            "TEST_ERROR"
        );
    }
}