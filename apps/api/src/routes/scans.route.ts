import { newScanSchema } from "@social-agent/shared";
import { Router } from "express";
import { z } from "zod";
import { ScansController } from "@/controllers/scans.controller";
import { validateMiddleware } from "@/middlewares/validate.middleware";
import { asyncHandler } from "@/utils/asyncHandler";

const router = Router();

const validateNewScan = validateMiddleware(z.object({ body: newScanSchema }));

router.post("/", validateNewScan, asyncHandler(ScansController.start));
router.get("/:id", asyncHandler(ScansController.get));

export default router;
