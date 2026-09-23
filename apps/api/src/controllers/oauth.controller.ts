import type { Request, Response } from "express";
import { SocialAccountsService } from "@/services/social-accounts.service";
import { pathParam } from "@/utils/idParam";

const queryText = (value: unknown) => (typeof value === "string" ? value : undefined);

export class OAuthController {
    static async callback(req: Request, res: Response) {
        const target = await SocialAccountsService.completeConnection(pathParam(req, "platform"), {
            code: queryText(req.query.code),
            state: queryText(req.query.state),
            error: queryText(req.query.error),
        });
        return res.redirect(302, target);
    }
}
