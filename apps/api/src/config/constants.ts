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
    time:{
        ONE_HOUR_MS: 60 * 60 * 1000,
        ONE_DAY_MS: 24 * 60 * 60 * 1000,
    }
} as const;
