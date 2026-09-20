import { Router } from "express";
import { MeController } from "@/controllers/me.controller";
import { asyncHandler } from "@/utils/asyncHandler";

const router = Router();

router.get("/", asyncHandler(MeController.me));

export default router;
