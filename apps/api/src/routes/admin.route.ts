import { inviteClientSchema, newBrandSchema } from "@social-agent/shared";
import { Router } from "express";
import { z } from "zod";
import { AdminClientsController } from "@/controllers/admin-clients.controller";
import { requireAdmin } from "@/middlewares/auth.middleware";
import { validateMiddleware } from "@/middlewares/validate.middleware";
import { asyncHandler } from "@/utils/asyncHandler";

const router = Router();

router.use(requireAdmin);

const validateInvite = validateMiddleware(z.object({ body: inviteClientSchema }));
const validateNewBrand = validateMiddleware(z.object({ body: newBrandSchema }));

router.get("/clients", asyncHandler(AdminClientsController.list));
router.post("/clients", validateInvite, asyncHandler(AdminClientsController.invite));
router.get("/clients/:id", asyncHandler(AdminClientsController.get));
router.post("/clients/:id/brands", validateNewBrand, asyncHandler(AdminClientsController.createBrand));

export default router;
