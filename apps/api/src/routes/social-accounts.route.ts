import { connectSocialAccountSchema, platformSchema } from "@social-agent/shared";
import { Router } from "express";
import { z } from "zod";
import { SocialAccountsController } from "@/controllers/social-accounts.controller";
import { validateMiddleware } from "@/middlewares/validate.middleware";
import { asyncHandler } from "@/utils/asyncHandler";

// Mounted under /brands/:brandId.
const router = Router({ mergeParams: true });

const validateConnect = validateMiddleware(z.object({ body: connectSocialAccountSchema }));
const validatePlatform = validateMiddleware(z.object({ params: z.object({ platform: platformSchema }) }));

router.get("/", asyncHandler(SocialAccountsController.list));
router.post("/connect", validateConnect, asyncHandler(SocialAccountsController.connect));
router.delete("/:platform", validatePlatform, asyncHandler(SocialAccountsController.disconnect));

export default router;
