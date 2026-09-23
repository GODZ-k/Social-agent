export function isUniqueViolation(error: unknown): boolean {
    const codeOf = (value: unknown) =>
        typeof value === "object" && value !== null && "code" in value ? (value as { code?: unknown }).code : undefined;

    return codeOf(error) === "23505" || codeOf((error as { cause?: unknown } | null)?.cause) === "23505";
}
