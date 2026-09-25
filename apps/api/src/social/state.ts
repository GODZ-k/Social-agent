import { platformSchema } from "@social-agent/shared";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { config } from "@/config/constants";
import { signatureMatches, signPayload } from "@/social/crypto";
import type { OAuthState } from "@/types/social";

const oauthStateSchema: z.ZodType<OAuthState> = z.object({
    brandId: z.uuid(),
    userId: z.uuid(),
    platform: platformSchema,
    nonce: z.string().min(1),
    exp: z.number().int(),
});

/** `<payload>.<signature>`: the callback has no session, so the signature is the identity. */
export function createState(input: Pick<OAuthState, "brandId" | "userId" | "platform">): string {
    const state: OAuthState = { ...input, nonce: randomBytes(16).toString("base64url"), exp: Date.now() + config.oauth.STATE_TTL_MS };
    const json = JSON.stringify(state);
    const payload = Buffer.from(json).toString("base64url");
    return `${payload}.${signPayload(payload)}`;
}

/** Null when not ours, malformed, or expired. */
export function readState(state: unknown): OAuthState | null {
    if (typeof state !== "string") return null;
    const [payload, signature] = state.split(".");
    if (!payload || !signature || !signatureMatches(payload, signature)) return null;

    const json = Buffer.from(payload, "base64url").toString("utf8");
    const data = parseJson(json);
    const parsed = oauthStateSchema.safeParse(data);
    if (!parsed.success || parsed.data.exp < Date.now()) return null;
    return parsed.data;
}

function parseJson(text: string): unknown {
    try {
        return JSON.parse(text);
    } catch {
        return undefined;
    }
}
