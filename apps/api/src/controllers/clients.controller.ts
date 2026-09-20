import type { Request, Response } from "express";
import { currentUser } from "@/middlewares/auth.middleware";
import { ClientsService } from "@/services/clients.service";

const idParam = (req: Request) => String(req.params.id);

export class ClientsController {
    static async list(req: Request, res: Response) {
        const data = await ClientsService.list(currentUser(req));
        return res.status(200).json({ success: true, data });
    }

    static async create(req: Request, res: Response) {
        const data = await ClientsService.create(currentUser(req), req.body);
        return res.status(201).json({ success: true, data });
    }

    static async get(req: Request, res: Response) {
        const data = await ClientsService.get(currentUser(req), idParam(req));
        return res.status(200).json({ success: true, data });
    }

    static async update(req: Request, res: Response) {
        const data = await ClientsService.update(currentUser(req), idParam(req), req.body);
        return res.status(200).json({ success: true, data });
    }

    static async delete(req: Request, res: Response) {
        await ClientsService.delete(currentUser(req), idParam(req));
        return res.status(204).end();
    }
}
