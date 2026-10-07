import { defineConfig } from "@trigger.dev/sdk";

export default defineConfig({
    project: process.env.TRIGGER_PROJECT_REF ?? "",
    runtime: "node",
    dirs: ["./src/trigger"],
    // A discovery run makes up to 24 Firecrawl requests behind a 10-per-minute key, so it needs
    // room to breathe. One hour is generous for both jobs and still bounded.
    maxDuration: 3600,
    retries: {
        enabledInDev: false,
        default: {
            maxAttempts: 4,
            factor: 2,
            minTimeoutInMs: 10_000,
            maxTimeoutInMs: 5 * 60_000,
            // Jitter. Two runs that fail at the same moment must not retry in lockstep and hit the
            // same rate limit again together.
            randomize: true,
        },
    },
});
