import type { Platform } from "@social-agent/shared";
import type { Request, Response } from "express";
import { currentUser } from "@/middlewares/auth.middleware";
import { SocialAccountsService } from "@/services/social-accounts.service";
import { pathParam } from "@/utils";

export class SocialAccountsController {
    static async list(req: Request, res: Response) {
        const user = currentUser(req);
        const brandId = pathParam(req, "brandId");
        const data = await SocialAccountsService.list(user, brandId);
        return res.status(200).json({ success: true, data });
    }

    static async connect(req: Request, res: Response) {
        const user = currentUser(req);
        const brandId = pathParam(req, "brandId");
        const data = await SocialAccountsService.connect(user, brandId, req.body.platform);
        return res.status(200).json({ success: true, data });
    }

    // The route validated `:platform`.
    static async disconnect(req: Request, res: Response) {
        const platform = pathParam(req, "platform") as Platform;
        const user = currentUser(req);
        const brandId = pathParam(req, "brandId");
        await SocialAccountsService.disconnect(user, brandId, platform);
        return res.status(204).end();
    }
}
