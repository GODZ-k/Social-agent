import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// Skills are files read at run time. In development this file is src/mastra/config/skills.ts, so
// the skills are in ../skills. tsup bundles everything into dist/server.js and does not include
// .md files, so the build copies them to dist/skills (scripts/copy-skills.mjs).
const here = dirname(fileURLToPath(import.meta.url));
const SKILLS_DIR = [join(here, "../skills"), join(here, "skills")].find((dir) => existsSync(dir));

/**
 * A skill's SKILL.md body, without its front matter, to put straight into an agent's instructions.
 * Use it when the agent must answer in one call: `skills:` gives the model tools, which cost calls.
 */
export function loadSkill(name: string): string {
  if (!SKILLS_DIR) throw new Error("Skills folder not found. The build must copy src/mastra/skills to dist/skills.");
  const file = readFileSync(join(SKILLS_DIR, name, "SKILL.md"), "utf8");
  return file.replace(/^---[\s\S]*?---\s*/, "").trim();
}
