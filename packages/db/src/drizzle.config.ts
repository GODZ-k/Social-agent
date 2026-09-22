import { defineConfig } from "drizzle-kit";

// The db:* scripts in package.json load the env file and point drizzle-kit at this config.
// Paths below are relative to packages/db, where those scripts run.
const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set.");

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/schema.ts",
  out: "./drizzle",
  dbCredentials: { url },
});
