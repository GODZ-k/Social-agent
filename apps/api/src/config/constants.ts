import type { ScanErrorCode } from "../scan/types";

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
    server: {
        // An open keep-alive connection can hold server.close() forever.
        SHUTDOWN_TIMEOUT_MS: 10_000,
    },
    brand: {
        // Real values arrive with the social accounts and analytics tables (phases 3 and 5).
        EMPTY_STATS: {
            followers: 0,
            followersDelta: 0,
            engagementRate: 0,
            engagementDelta: 0,
            scheduled: 0,
            pendingApprovals: 0,
        },
    },
    scan: {
        // Covers fetching only; the model call comes after.
        BUDGET_MS: 45_000,
        // A free Firecrawl key allows 10 requests a minute and a scan is up to 7.
        CONCURRENCY: 1,
        ACTIVE_STATUSES: ["queued", "running"],
        MAX_PAGES: 6,
        MAX_PAGES_PER_GROUP: 2,
        MAX_HEADINGS_PER_PAGE: 30,
        MAX_WORDS_PER_PAGE: 1500,
        // Fewer readable words than this across the site means there is nothing to draft from.
        MIN_WORDS_PER_SITE: 80,
        MAX_JSON_LD_DEPTH: 6,
        MAX_COLORS: 5,
        INTERRUPTED_MESSAGE: "The scan was interrupted. Please try again.",
        SERVER_ERROR_MESSAGE: "Something went wrong on our side. Please try again.",
        // Shown to the business owner on the onboarding screen, so: plain words.
        MESSAGES: {
            INVALID_URL: "That does not look like a website address. Try something like yourbusiness.com.",
            BLOCKED_ADDRESS: "We can only read public websites. Check the address and try again.",
            SITE_UNREACHABLE: "We could not open that website. Check the address, or try again in a minute.",
            NOT_A_WEBSITE: "That address is a file, not a website. Enter your home page instead.",
            NO_CONTENT: "We could not find any text to read on that website. You can enter your brand details by hand instead.",
            INTERPRETATION_FAILED: "We read your website but could not finish the brand draft. Please try again.",
        } satisfies Record<ScanErrorCode, string>,
    },
    firecrawl: {
        SCRAPE_URL: "https://api.firecrawl.dev/v2/scrape",
        // A browser render of one page takes 2-10 s.
        RENDER_TIMEOUT_MS: 30_000,
        // Our own abort fires this long after the timeout we give Firecrawl.
        ABORT_GRACE_MS: 5_000,
        MAX_HTML_CHARS: 2_000_000,
        // A PDF or an image comes back as a stub document shorter than this.
        MIN_WEBPAGE_CHARS: 200,
    },
    brandAnalyst: {
        // About 7k tokens of page text at ~4 characters per token. The home page gets the largest share.
        TEXT_BUDGET_CHARS: 28_000,
        HOME_PAGE_CHARS: 8_000,
        REJECTION_NOTE_CHARS: 1_000,
    },
    time: {
        ONE_HOUR_MS: 60 * 60 * 1000,
        ONE_DAY_MS: 24 * 60 * 60 * 1000,
    },
} as const;
