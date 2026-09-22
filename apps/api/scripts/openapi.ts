// Writes apps/api/openapi/openapi.json from the operation registry (src/openapi).
// Idempotent: running it twice changes nothing.
// Run: pnpm --filter api run openapi
// Run with --check to fail instead of writing, when the committed file is stale: pnpm --filter api run openapi:check
import fs from "node:fs";
import path from "node:path";
import { buildOpenApiDocument } from "../src/openapi/build";

// Resolved from this file, not the process cwd, so the script works the same run from anywhere.
const OPENAPI_DIR = path.join(import.meta.dirname, "..", "openapi");
const OPENAPI_JSON_PATH = path.join(OPENAPI_DIR, "openapi.json");

/** The exact bytes that belong on disk, shared by the write and the --check comparison. */
function serialize(): string {
    return `${JSON.stringify(buildOpenApiDocument(), null, 2)}\n`;
}

function writeOpenApiJson(): void {
    fs.mkdirSync(OPENAPI_DIR, { recursive: true });
    fs.writeFileSync(OPENAPI_JSON_PATH, serialize());
    console.log(`Wrote ${OPENAPI_JSON_PATH}.`);
}

function checkOpenApiJson(): void {
    const onDisk = fs.existsSync(OPENAPI_JSON_PATH) ? fs.readFileSync(OPENAPI_JSON_PATH, "utf8") : null;
    if (onDisk === serialize()) return;

    console.error("openapi.json is out of date: run pnpm --filter api run openapi");
    process.exit(1);
}

if (process.argv.includes("--check")) checkOpenApiJson();
else writeOpenApiJson();
