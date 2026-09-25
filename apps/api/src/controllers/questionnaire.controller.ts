import type { Request, Response } from "express";
import { currentUser } from "@/middlewares/auth.middleware";
import { QuestionnaireService } from "@/services/questionnaire.service";

/** The `:brandId` segment of the parent brands route; `mergeParams` carries it here. */
const brandIdParam = (req: Request) => String(req.params.brandId);

export class QuestionnaireController {
    static async questions(req: Request, res: Response) {
        const user = currentUser(req);
        const brandId = brandIdParam(req);
        const data = await QuestionnaireService.questions(user, brandId, req.body.chatLanguage);
        return res.status(200).json({ success: true, data });
    }

    static async state(req: Request, res: Response) {
        const user = currentUser(req);
        const brandId = brandIdParam(req);
        const data = await QuestionnaireService.state(user, brandId);
        return res.status(200).json({ success: true, data });
    }

    static async saveAnswers(req: Request, res: Response) {
        const user = currentUser(req);
        const brandId = brandIdParam(req);
        const data = await QuestionnaireService.saveAnswers(user, brandId, req.body.sessionId, req.body.answers);
        return res.status(200).json({ success: true, data });
    }

    static async submit(req: Request, res: Response) {
        const user = currentUser(req);
        const brandId = brandIdParam(req);
        const data = await QuestionnaireService.submit(user, brandId, req.body.sessionId);
        return res.status(200).json({ success: true, data });
    }
}
