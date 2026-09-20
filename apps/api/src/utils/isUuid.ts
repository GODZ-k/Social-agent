import { z } from "zod";

/** A malformed id would make Postgres throw, so callers treat it as "not found" up front. */
export function isUuid(value: string) {
    return z.uuid().safeParse(value).success;
}
