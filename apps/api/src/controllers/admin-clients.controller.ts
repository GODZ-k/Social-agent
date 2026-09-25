import type { Request, Response } from "express";
import { currentUser } from "@/middlewares/auth.middleware";
import { AdminClientsService } from "@/services/admin-clients.service";
import { idParam } from "@/utils";

export class AdminClientsController {
    static async list(_req: Request, res: Response) {
        const data = await AdminClientsService.list();
        return res.status(200).json({ success: true, data });
    }

    static async get(req: Request, res: Response) {
        const id = idParam(req);
        const data = await AdminClientsService.get(id);
        return res.status(200).json({ success: true, data });
    }

    static async invite(req: Request, res: Response) {
        const user = currentUser(req);
        const data = await AdminClientsService.invite(user, req.body);
        return res.status(201).json({ success: true, data });
    }

    static async createBrand(req: Request, res: Response) {
        const user = currentUser(req);
        const id = idParam(req);
        const data = await AdminClientsService.createBrand(user, id, req.body);
        return res.status(201).json({ success: true, data });
    }
}
