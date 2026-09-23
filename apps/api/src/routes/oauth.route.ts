import { Router } from "express";
import { OAuthController } from "@/controllers/oauth.controller";
import { asyncHandler } from "@/utils/asyncHandler";

// No Bearer token here: a redirect cannot carry headers. The signed `state` is the identity.
const router = Router();

router.get("/:platform/callback", asyncHandler(OAuthController.callback));

export default router;
