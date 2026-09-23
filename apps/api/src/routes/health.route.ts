import { Router } from "express";
import { HealthController } from "@/controllers/health.controller";
import { asyncHandler } from "@/utils/asyncHandler";

const router = Router();

router.get("/", asyncHandler(HealthController.healthCheck));
router.get("/test-error", asyncHandler(HealthController.testError));

export default router;
