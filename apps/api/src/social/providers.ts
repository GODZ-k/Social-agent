import { createInstagramProvider, type Provider } from "@social-agent/social-connect";
import type { Platform } from "@social-agent/shared";
import { env } from "@/config/env";

/** Null means no app keys for that network yet. */
export function providerFor(platform: Platform): Provider | null {
    if (platform === "instagram" && env.INSTAGRAM_APP_ID && env.INSTAGRAM_APP_SECRET) {
        return createInstagramProvider({
            appId: env.INSTAGRAM_APP_ID,
            appSecret: env.INSTAGRAM_APP_SECRET,
            redirectUri: env.INSTAGRAM_REDIRECT_URI ?? `http://localhost:${env.PORT}/api/v1/oauth/instagram/callback`,
        });
    }
    return null;
}
