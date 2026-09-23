import type { Platform } from "@social-agent/shared";
import type { Request, Response } from "express";
import { currentUser } from "@/middlewares/auth.middleware";
import { SocialAccountsService } from "@/services/social-accounts.service";
import { pathParam } from "@/utils";

export class SocialAccountsController {
    static async list(req: Request, res: Response) {
        const data = await SocialAccountsService.list(currentUser(req), pathParam(req, "brandId"));
        return res.status(200).json({ success: true, data });
    }

    static async connect(req: Request, res: Response) {
        const data = await SocialAccountsService.connect(currentUser(req), pathParam(req, "brandId"), req.body.platform);
        return res.status(200).json({ success: true, data });
    }

    // The route validated `:platform`.
    static async disconnect(req: Request, res: Response) {
        const platform = pathParam(req, "platform") as Platform;
        await SocialAccountsService.disconnect(currentUser(req), pathParam(req, "brandId"), platform);
        return res.status(204).end();
    }
}
