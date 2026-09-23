import { z } from "zod";

export function isUuid(value: string) {
    return z.uuid().safeParse(value).success;
}
