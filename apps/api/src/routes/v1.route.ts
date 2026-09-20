import { Router } from "express";
import { clerkAuth } from "@/auth/clerk";
import { requireUser } from "@/middlewares/auth.middleware";
import clientsRoute from "@/routes/clients.route";
import meRoute from "@/routes/me.route";

const router = Router();

router.use(clerkAuth);
router.use(requireUser);

router.use("/me", meRoute);
router.use("/clients", clientsRoute);

export default router;
