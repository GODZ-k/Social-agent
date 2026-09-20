import type { Request, Response } from "express";
import { currentUser } from "@/middlewares/auth.middleware";

export class MeController {
    static async me(req: Request, res: Response) {
        const { id, email, role } = currentUser(req);
        return res.status(200).json({ success: true, data: { id, email, role } });
    }
}
