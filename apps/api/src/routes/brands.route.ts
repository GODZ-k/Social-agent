import { brandPatchSchema, newBrandSchema } from "@social-agent/shared";
import { Router } from "express";
import { z } from "zod";
import { BrandsController } from "@/controllers/brands.controller";
import { validateMiddleware } from "@/middlewares/validate.middleware";
import { asyncHandler } from "@/utils/asyncHandler";

const router = Router();

const validateNewBrand = validateMiddleware(z.object({ body: newBrandSchema }));
const validateBrandPatch = validateMiddleware(z.object({ body: brandPatchSchema }));

router.get("/", asyncHandler(BrandsController.list));
router.post("/", validateNewBrand, asyncHandler(BrandsController.create));
router.get("/:id", asyncHandler(BrandsController.get));
router.patch("/:id", validateBrandPatch, asyncHandler(BrandsController.update));
router.delete("/:id", asyncHandler(BrandsController.archive));

export default router;
