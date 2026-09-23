import type { Platform } from "@social-agent/shared";

/** Signed into the OAuth `state` and read back on the callback. `exp` is Unix milliseconds. */
export interface OAuthState {
    brandId: string;
    userId: string;
    platform: Platform;
    nonce: string;
    exp: number;
}

/** Query of the network's redirect. All optional: the person may have said no. */
export interface OAuthCallbackQuery {
    code?: string;
    state?: string;
    error?: string;
}
