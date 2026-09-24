import { cpSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const packageDir = dirname(createRequire(import.meta.url).resolve("@social-agent/agents/package.json"));
cpSync(join(packageDir, "skills"), "dist/skills", { recursive: true });
console.log("copied @social-agent/agents/skills -> dist/skills");
