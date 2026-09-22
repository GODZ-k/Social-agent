import type { Request, Response } from "express";
import { HealthService } from "@/services/health.service";
import { AppError } from "@/utils/AppError";

export class HealthController {
    /** 503 when the database is down, so a load balancer takes this instance out. */
    static async healthCheck(_req: Request, res: Response) {
        const report = await HealthService.check();
        const isHealthy = report.status === "healthy";

        return res.status(isHealthy ? 200 : 503).json({
            success: isHealthy,
            data: report,
        });
    }

    /** Proves the error middleware is wired up. */
    static async testError(_req: Request, _res: Response): Promise<never> {
        throw new AppError("This is a test error", 400, "TEST_ERROR");
    }
}
