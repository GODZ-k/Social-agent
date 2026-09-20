import { clientPatchSchema, newClientSchema } from "@social-agent/shared";
import { Router } from "express";
import { z } from "zod";
import { ClientsController } from "@/controllers/clients.controller";
import { validateMiddleware } from "@/middlewares/validate.middleware";
import { asyncHandler } from "@/utils/asyncHandler";

const router = Router();

const validateNewClient = validateMiddleware(z.object({ body: newClientSchema }));
const validateClientPatch = validateMiddleware(z.object({ body: clientPatchSchema }));

router.get("/", asyncHandler(ClientsController.list));
router.post("/", validateNewClient, asyncHandler(ClientsController.create));
router.get("/:id", asyncHandler(ClientsController.get));
router.patch("/:id", validateClientPatch, asyncHandler(ClientsController.update));
router.delete("/:id", asyncHandler(ClientsController.delete));

export default router;
