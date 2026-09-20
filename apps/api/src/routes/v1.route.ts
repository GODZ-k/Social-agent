import { Router } from "express";
import { clerkAuth } from "@/auth/clerk";
import { requireUser } from "@/middlewares/auth.middleware";
import adminRoute from "@/routes/admin.route";
import brandsRoute from "@/routes/brands.route";
import meRoute from "@/routes/me.route";

const router = Router();

router.use(clerkAuth);
router.use(requireUser);

router.use("/me", meRoute);
router.use("/brands", brandsRoute);
router.use("/admin", adminRoute);

export default router;
