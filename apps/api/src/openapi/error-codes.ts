/**
 * Every error code the API answers with, and the status and message that come with it.
 * This is the one table: `errorMiddleware` sends `{ success: false, error: { code, message, details? } }`,
 * and the OpenAPI document describes each code from here. Keep it in step with the `AppError`
 * throws in `src/services`, `src/middlewares` and `src/controllers`.
 */
export const ERROR_CODES = {
    VALIDATION_ERROR: { status: 400, message: "Some fields are invalid." },
    INVALID_JSON: { status: 400, message: "The request body is not valid JSON." },
    /** Thrown on purpose by `GET /health/test-error`, the only endpoint that uses it. */
    TEST_ERROR: { status: 400, message: "This is a test error" },
    UNAUTHENTICATED: { status: 401, message: "Sign in to continue." },
    FORBIDDEN: { status: 403, message: "Only an admin can do this." },
    EMAIL_REQUIRED: { status: 403, message: "Your account has no email address. Add one, then try again." },
    BRAND_NOT_FOUND: { status: 404, message: "This brand doesn't exist, or you don't have access to it." },
    CLIENT_NOT_FOUND: { status: 404, message: "This client doesn't exist." },
    SCAN_NOT_FOUND: { status: 404, message: "This scan doesn't exist, or you don't have access to it." },
    CLIENT_EXISTS: { status: 409, message: "Someone with this email is already here." },
    SCAN_NOT_DONE: { status: 409, message: "This scan hasn't finished yet." },
    EMAIL_IN_USE: {
        status: 409,
        message: "This email already belongs to another account. Verify your email address, then try again.",
    },
    INTERNAL_SERVER_ERROR: { status: 500, message: "Something went wrong" },
    INVITE_FAILED: { status: 502, message: "The invitation email could not be sent. Try again." },
} as const satisfies Record<string, { status: number; message: string }>;

export type ErrorCode = keyof typeof ERROR_CODES;

export function statusOf(code: ErrorCode): number {
    return ERROR_CODES[code].status;
}

export function messageOf(code: ErrorCode): string {
    return ERROR_CODES[code].message;
}
