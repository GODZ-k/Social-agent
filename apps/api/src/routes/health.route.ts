import { asyncHandler } from "@/utils/asyncHandler";
import { HealthController } from "@/controllers/health.controller";
import { Router } from "express";
const router = Router();



router.get("/", asyncHandler(HealthController.healthCheck));
router.get("/test-error", asyncHandler(HealthController.testError));
export default router;