import type { Request, Response } from "express";
import { currentUser } from "@/middlewares/auth.middleware";
import { ScansService } from "@/services/scans.service";
import { idParam } from "@/utils";

export class ScansController {
    static async start(req: Request, res: Response) {
        const user = currentUser(req);
        const { scan, created } = await ScansService.start(user, req.body);
        return res.status(created ? 202 : 200).json({ success: true, data: scan });
    }

    static async get(req: Request, res: Response) {
        const user = currentUser(req);
        const id = idParam(req);
        const data = await ScansService.get(user, id);
        return res.status(200).json({ success: true, data });
    }
}
