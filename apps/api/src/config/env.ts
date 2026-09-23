import "dotenv/config";
import { z } from "zod";

const commaSeparatedList = (fallback: string) =>
    z.string().default(fallback).transform((value) => value.split(",").map((item) => item.trim()).filter(Boolean));

const envSchema = z.object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    DATABASE_URL: z.string().regex(/^postgres(ql)?:\/\//, "must start with postgres:// or postgresql://"),
    CLERK_SECRET_KEY: z.string().min(1),
    CLERK_PUBLISHABLE_KEY: z.string().min(1),
    ADMIN_EMAILS: commaSeparatedList(""),
    PORT: z.coerce.number().int().positive().default(4000),
    CORS_ORIGINS: commaSeparatedList("http://localhost:3000"),
    FRONTEND_URL: z.url().default("http://localhost:3000"),
    /** `openssl rand -hex 32` */
    SOCIAL_TOKEN_KEY: z.string().regex(/^[0-9a-f]{64}$/i, "must be 64 hex characters").optional(),
    INSTAGRAM_APP_ID: z.string().min(1).optional(),
    INSTAGRAM_APP_SECRET: z.string().min(1).optional(),
    /** Must match the Meta app. Defaults to this API on localhost. */
    INSTAGRAM_REDIRECT_URI: z.url().optional(),
});

// Stops the server at start-up with a message naming every missing or invalid variable.
function loadEnv() {
    const result = envSchema.safeParse(process.env);
    if (result.success) return result.data;

    console.error("Invalid environment. Fix these in apps/api/.env:");
    for (const issue of result.error.issues) {
        const name = issue.path.join(".");
        const problem = process.env[name] === undefined ? "is missing" : issue.message;
        console.error(`${name}: ${problem}`);
    }
    process.exit(1);
}

export const env = loadEnv();
