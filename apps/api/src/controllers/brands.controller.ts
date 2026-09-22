import type { Request, Response } from "express";
import { currentUser } from "@/middlewares/auth.middleware";
import { BrandsService } from "@/services/brands.service";

const idParam = (req: Request) => String(req.params.id);

export class BrandsController {
    static async list(req: Request, res: Response) {
        const data = await BrandsService.list(currentUser(req));
        return res.status(200).json({ success: true, data });
    }

    static async create(req: Request, res: Response) {
        const data = await BrandsService.create(currentUser(req), req.body);
        return res.status(201).json({ success: true, data });
    }

    static async get(req: Request, res: Response) {
        const data = await BrandsService.get(currentUser(req), idParam(req));
        return res.status(200).json({ success: true, data });
    }

    static async update(req: Request, res: Response) {
        const data = await BrandsService.update(currentUser(req), idParam(req), req.body);
        return res.status(200).json({ success: true, data });
    }

    /** DELETE archives: the brand disappears from every list, its history stays. */
    static async archive(req: Request, res: Response) {
        await BrandsService.archive(currentUser(req), idParam(req));
        return res.status(204).end();
    }
}
