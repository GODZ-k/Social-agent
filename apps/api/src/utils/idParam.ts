import type { Request } from "express";

/** The `:id` path segment. Express types it as optional; every route using it declares it. */
export function idParam(req: Request): string {
    return String(req.params.id);
}
