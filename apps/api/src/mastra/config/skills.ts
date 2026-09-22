import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// Skills are files read at run time. In development this file is src/mastra/config/skills.ts, so
// the skills are in ../skills. tsup bundles everything into dist/server.js and does not include
// .md files, so the build copies them to dist/skills (scripts/copy-skills.mjs).
const here = dirname(fileURLToPath(import.meta.url));
const SKILLS_DIR = [join(here, "../skills"), join(here, "skills")].find((dir) => existsSync(dir));

/**
 * The body of a skill's SKILL.md, without its front matter, for putting into an agent's
 * instructions. Use this for an agent that must answer in one model call: attaching the skill
 * through `skills:` gives the model tools to open it, which costs extra calls.
 */
export function loadSkill(name: string): string {
  if (!SKILLS_DIR) throw new Error("Skills folder not found. The build must copy src/mastra/skills to dist/skills.");
  const file = readFileSync(join(SKILLS_DIR, name, "SKILL.md"), "utf8");
  return file.replace(/^---[\s\S]*?---\s*/, "").trim();
}
