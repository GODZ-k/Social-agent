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

export function isoOrNull(date: Date | null | undefined): string | null {
    return date ? date.toISOString() : null;
}

/** The row an INSERT ... RETURNING wrote. Postgres always returns it, so its absence is a bug. */
export function insertedRow<T>(rows: T[], table: string): T {
    const [row] = rows;
    if (!row) throw new Error(`Insert into ${table} returned no row`);
    return row;
}

export function idParam(req: Request): string {
    return pathParam(req, "id");
}

export function pathParam(req: Request, name: string): string {
    return String(req.params[name]);
}
