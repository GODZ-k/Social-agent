import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const SKILLS_DIR = [join(here, "../skills"), join(here, "skills")].find((dir) => existsSync(dir));

export function loadSkill(name: string): string {
  if (!SKILLS_DIR) throw new Error("Skills folder not found. A bundling app must copy packages/agents/skills next to its build.");
  const file = readFileSync(join(SKILLS_DIR, name, "SKILL.md"), "utf8");
  return file.replace(/^---[\s\S]*?---\s*/, "").trim();
}
