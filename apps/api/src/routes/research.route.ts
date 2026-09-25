import { Router } from "express";
import { ResearchController } from "@/controllers/research.controller";
import { asyncHandler } from "@/utils/asyncHandler";

// Mounted under /brands/:brandId/research; mergeParams keeps :brandId readable here. No body to validate.
const router = Router({ mergeParams: true });

router.post("/", asyncHandler(ResearchController.start));
router.get("/", asyncHandler(ResearchController.get));

export default router;
