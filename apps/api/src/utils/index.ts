import type { Request } from "express";
import { z } from "zod";

export function isUuid(value: string) {
    return z.uuid().safeParse(value).success;
}

export function isUniqueViolation(error: unknown): boolean {
    const codeOf = (value: unknown) =>
        typeof value === "object" && value !== null && "code" in value ? (value as { code?: unknown }).code : undefined;

    return codeOf(error) === "23505" || codeOf((error as { cause?: unknown } | null)?.cause) === "23505";
}


export function idParam(req: Request): string {
    return pathParam(req, "id");
}

export function pathParam(req: Request, name: string): string {
    return String(req.params[name]);
}
