import type { Request, Response } from "express";
import { currentUser } from "@/middlewares/auth.middleware";
import { MeService } from "@/services/me.service";

export class MeController {
    static async me(req: Request, res: Response) {
        const data = MeService.profile(currentUser(req));
        return res.status(200).json({ success: true, data });
    }

    static async overview(req: Request, res: Response) {
        const data = await MeService.overview(currentUser(req));
        return res.status(200).json({ success: true, data });
    }
}
