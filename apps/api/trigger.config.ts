import { defineConfig } from "@trigger.dev/sdk";
// @ts-expect-error - a plain .mjs helper shared with the tsup build, which has no types.
import { copySkills } from "./scripts/copy-skills.mjs";

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
    build: {
        extensions: [
            /**
             * The agents read their skills off disk at import time, and Trigger bundles the tasks
             * into its own output directory, where `packages/agents/skills` is not. The chunk
             * holding `loadSkill` sits at the root of that directory, so the folder goes next to it.
             *
             * `additionalFiles` cannot do this: it keeps each match's path relative to the working
             * directory, which lands the skills under `packages/agents/skills/`, not `skills/`.
             */
            {
                name: "agent-skills",
                onBuildComplete(context, manifest) {
                    const destination = copySkills(`${manifest.outputPath}/skills`);
                    context.logger.debug(`[agent-skills] copied @social-agent/agents/skills -> ${destination}`);
                },
            },
        ],
    },
});
