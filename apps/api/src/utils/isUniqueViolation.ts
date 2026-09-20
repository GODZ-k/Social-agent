/**
 * True for a Postgres unique-constraint error (code 23505).
 * Drizzle wraps the driver's error, so the code may sit on `cause`.
 */
export function isUniqueViolation(error: unknown): boolean {
    const codeOf = (value: unknown) =>
        typeof value === "object" && value !== null && "code" in value ? (value as { code?: unknown }).code : undefined;

    return codeOf(error) === "23505" || codeOf((error as { cause?: unknown } | null)?.cause) === "23505";
}
