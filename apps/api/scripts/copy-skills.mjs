import { cpSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";

/**
 * `loadSkill` in `@social-agent/agents` reads a skill off disk, next to its own built file, so any
 * app that bundles the package has to carry the folder along. Two builds do: tsup (`dist/skills`,
 * through its `onSuccess` hook) and Trigger.dev (its own output directory, through the extension
 * in `trigger.config.ts`).
 */
export function copySkills(destination) {
    const packageDir = dirname(createRequire(import.meta.url).resolve("@social-agent/agents/package.json"));
    cpSync(join(packageDir, "skills"), destination, { recursive: true });
    return destination;
}

// tsup's onSuccess runs this file as a script; the Trigger extension imports the function instead.
const runAsScript = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (runAsScript) console.log(`copied @social-agent/agents/skills -> ${copySkills("dist/skills")}`);
