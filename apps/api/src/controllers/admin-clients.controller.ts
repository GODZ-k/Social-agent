import type { Request, Response } from "express";
import { currentUser } from "@/middlewares/auth.middleware";
import { AdminClientsService } from "@/services/admin-clients.service";

const idParam = (req: Request) => String(req.params.id);

export class AdminClientsController {
    static async list(_req: Request, res: Response) {
        const data = await AdminClientsService.list();
        return res.status(200).json({ success: true, data });
    }

    static async get(req: Request, res: Response) {
        const data = await AdminClientsService.get(idParam(req));
        return res.status(200).json({ success: true, data });
    }

    static async invite(req: Request, res: Response) {
        const data = await AdminClientsService.invite(currentUser(req), req.body);
        return res.status(201).json({ success: true, data });
    }

    static async createBrand(req: Request, res: Response) {
        const data = await AdminClientsService.createBrand(currentUser(req), idParam(req), req.body);
        return res.status(201).json({ success: true, data });
    }
}
