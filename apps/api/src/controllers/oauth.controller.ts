import type { Request, Response } from "express";
import { SocialAccountsService } from "@/services/social-accounts.service";
import { pathParam } from "@/utils";

const queryText = (value: unknown) => (typeof value === "string" ? value : undefined);

export class OAuthController {
    static async callback(req: Request, res: Response) {
        const platform = pathParam(req, "platform");
        const query = {
            code: queryText(req.query.code),
            state: queryText(req.query.state),
            error: queryText(req.query.error),
        };
        const target = await SocialAccountsService.completeConnection(platform, query);
        return res.redirect(302, target);
    }
}
