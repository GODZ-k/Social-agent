import type { Request, Response } from "express";
import { currentUser } from "@/middlewares/auth.middleware";
import { IntakeService } from "@/services/intake.service";

/** The `:brandId` segment of the parent brands route; `mergeParams` carries it here. */
const brandIdParam = (req: Request) => String(req.params.brandId);

export class IntakeController {
    static async questions(req: Request, res: Response) {
        const data = await IntakeService.questions(currentUser(req), brandIdParam(req), req.body.chatLanguage);
        return res.status(200).json({ success: true, data });
    }

    static async state(req: Request, res: Response) {
        const data = await IntakeService.state(currentUser(req), brandIdParam(req));
        return res.status(200).json({ success: true, data });
    }

    static async saveAnswers(req: Request, res: Response) {
        const data = await IntakeService.saveAnswers(currentUser(req), brandIdParam(req), req.body.sessionId, req.body.answers);
        return res.status(200).json({ success: true, data });
    }

    static async approve(req: Request, res: Response) {
        const data = await IntakeService.approve(currentUser(req), brandIdParam(req), req.body.sessionId);
        return res.status(200).json({ success: true, data });
    }
}
