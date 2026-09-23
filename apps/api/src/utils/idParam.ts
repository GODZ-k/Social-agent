import type { Request } from "express";

export function idParam(req: Request): string {
    return pathParam(req, "id");
}

export function pathParam(req: Request, name: string): string {
    return String(req.params[name]);
}
