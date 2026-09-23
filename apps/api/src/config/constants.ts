/** Constants used across the API. Values that come from the environment live in `env.ts`. */
export const config = {
    crypto: {
        ALGORITHM: "aes-256-gcm",
        FORMAT_VERSION: "v1",
        IV_BYTES: 12,
        KEY_BYTES: 32,
    },
    oauth: {
        STATE_TTL_MS: 10 * 60 * 1000,
        SETTINGS_TAB: "accounts",
    },
} as const;
