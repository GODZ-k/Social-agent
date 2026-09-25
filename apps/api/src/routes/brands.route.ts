import { brandPatchSchema, newBrandSchema } from "@social-agent/shared";
import { Router } from "express";
import { z } from "zod";
import { BrandsController } from "@/controllers/brands.controller";
import { validateMiddleware } from "@/middlewares/validate.middleware";
import socialAccountsRoute from "@/routes/social-accounts.route";
import intakeRoute from "@/routes/intake.route";
import researchRoute from "@/routes/research.route";
import { asyncHandler } from "@/utils/asyncHandler";

const router = Router();

const validateNewBrand = validateMiddleware(z.object({ body: newBrandSchema }));
const validateBrandPatch = validateMiddleware(z.object({ body: brandPatchSchema }));

router.get("/", asyncHandler(BrandsController.list));
router.post("/", validateNewBrand, asyncHandler(BrandsController.create));
router.get("/:id", asyncHandler(BrandsController.get));
router.patch("/:id", validateBrandPatch, asyncHandler(BrandsController.update));
router.delete("/:id", asyncHandler(BrandsController.archive));
router.use("/:brandId/social-accounts", socialAccountsRoute);

// The Account Manager's intake: questions, answers, approval (which starts research).
router.use("/:brandId/intake", intakeRoute);

// Brand-scoped research: POST starts a run, GET polls it and returns the latest brief and profile.
router.use("/:brandId/research", researchRoute);

export default router;
