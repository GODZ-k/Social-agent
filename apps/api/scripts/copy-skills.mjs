// tsup does not bundle .md files, and agents read their skills at run time (src/mastra/config/skills.ts).
import { cpSync } from "node:fs";

cpSync("src/mastra/skills", "dist/skills", { recursive: true });
console.log("copied src/mastra/skills -> dist/skills");
