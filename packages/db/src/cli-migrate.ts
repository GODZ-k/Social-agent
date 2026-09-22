import { runMigrations } from "./migrate.js";

// The db:migrate script in package.json loads the env file. In CI and production
// the platform sets DATABASE_URL instead.
const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

await runMigrations(url);
console.log("Migrations applied.");
