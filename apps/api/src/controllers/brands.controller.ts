import type { Request, Response } from "express";
import { currentUser } from "@/middlewares/auth.middleware";
import { BrandsService } from "@/services/brands.service";
import { idParam } from "@/utils";

export class BrandsController {
    static async list(req: Request, res: Response) {
        const user = currentUser(req);
        const data = await BrandsService.list(user);
        return res.status(200).json({ success: true, data });
    }

    static async create(req: Request, res: Response) {
        const user = currentUser(req);
        const data = await BrandsService.create(user, req.body);
        return res.status(201).json({ success: true, data });
    }

    static async get(req: Request, res: Response) {
        const user = currentUser(req);
        const id = idParam(req);
        const data = await BrandsService.get(user, id);
        return res.status(200).json({ success: true, data });
    }

    static async update(req: Request, res: Response) {
        const user = currentUser(req);
        const id = idParam(req);
        const data = await BrandsService.update(user, id, req.body);
        return res.status(200).json({ success: true, data });
    }

    /** DELETE archives: the brand disappears from every list, its history stays. */
    static async archive(req: Request, res: Response) {
        const user = currentUser(req);
        const id = idParam(req);
        await BrandsService.archive(user, id);
        return res.status(204).end();
    }
}
