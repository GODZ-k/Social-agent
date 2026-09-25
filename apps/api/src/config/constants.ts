import type { ScanErrorCode } from "@/scan/types";

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
    jobs: {
        // Stored on a scan or research run that threw; the details stay in the server log.
        SERVER_ERROR_MESSAGE: "Something went wrong on our side. Please try again.",
    },
    scan: {
        // Covers fetching only; the model call comes after.
        BUDGET_MS: 45_000,
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
        NO_VOICE_WARNING: "The website did not show a clear brand voice. Pick a few words for it yourself.",
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
        SEARCH_URL: "https://api.firecrawl.dev/v2/search",
        // A search answered in 2-4 s when probed.
        SEARCH_TIMEOUT_MS: 15_000,
        // Per the discovery spec; the API itself accepts far more.
        MAX_SEARCH_HITS: 5,
        // Enough of a page for a research agent to judge it; a full page would crowd the model's context.
        MAX_MAIN_TEXT_CHARS: 6_000,
        // Below this the scan's extractor stripped the page bare (a Shopify slideshow with "banner" classes left 8 characters), so it is read more plainly.
        MIN_USEFUL_TEXT_CHARS: 300,
    },
    research: {
        ACTIVE_STATUSES: ["queued", "running"],
        INTERRUPTED_MESSAGE: "The research was interrupted. Please try again.",
        // One discovery run's budget, shared by both agents (the discovery spec).
        SEARCHES_PER_RUN: 8,
        READS_PER_RUN: 12,
        RUN_BUDGET_MS: 6 * 60_000,
        RESULTS_PER_SEARCH: 5,
        // Model calls one agent may make in its tool loop.
        MAX_AGENT_STEPS: 12,
        // Told to the model when a tool call fails, so it carries on instead of stopping.
        COULD_NOT_READ_NOTE: "Could not read this page.",
        SEARCH_FAILED_NOTE: "The search did not answer. Try different words, or conclude from what you have.",
    },
    questionnaire: {
        QUESTIONS_FAILED: "We could not prepare your questions. Please try again.",
        REVIEW_FAILED: "We could not check your answers. Please try again.",
    },
    time: {
        ONE_HOUR_MS: 60 * 60 * 1000,
        ONE_DAY_MS: 24 * 60 * 60 * 1000,
    },
} as const;
