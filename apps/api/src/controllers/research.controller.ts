import type { Request, Response } from "express";
import { currentUser } from "@/middlewares/auth.middleware";
import { ResearchService } from "@/services/research.service";

/** The `:brandId` segment of the parent brands route; `mergeParams` carries it here. */
const brandIdParam = (req: Request) => String(req.params.brandId);

export class ResearchController {
    /** 202 when a run was started; 409 with the running run in `data` when the brand already has one. */
    static async start(req: Request, res: Response) {
        const user = currentUser(req);
        const brandId = brandIdParam(req);
        const { research, created } = await ResearchService.start(user, brandId);
        if (created) return res.status(202).json({ success: true, data: research });

        return res.status(409).json({
            success: false,
            error: { code: "RESEARCH_RUNNING", message: "Research is already running for this brand." },
            data: research,
        });
    }

    static async get(req: Request, res: Response) {
        const user = currentUser(req);
        const brandId = brandIdParam(req);
        const data = await ResearchService.get(user, brandId);
        return res.status(200).json({ success: true, data });
    }
}
