// Reads the Express routers under src/ (app.ts and src/routes/*.route.ts) and returns every route
// the API serves, following each `.use("/prefix", someRoute)` mount.
//
// Read by scripts/openapi-check.ts, so the check compares the real Express routes with the
// operations in the generated document rather than with a second hand-written list.
import fs from "node:fs";
import path from "node:path";

export type Route = { method: string; path: string };

const src = path.join(import.meta.dirname, "..", "src");

/** `"@/routes/me.route"` -> absolute file path. */
const resolveImport = (spec: string): string => `${path.join(src, spec.replace(/^@\//, "").replace(/^\.\//, ""))}.ts`;

const join = (a: string, b: string): string =>
    `/${[a, b].join("/")}`.replace(/\/+/g, "/").replace(/(.)\/$/, "$1");

function routesOf(file: string, prefix: string): Route[] {
    const code = fs.readFileSync(file, "utf8");

    const imports: Record<string, string> = {};
    for (const match of code.matchAll(/import\s+(\w+)\s+from\s+"(@\/routes\/[^"]+|\.\/routes\/[^"]+)"/g)) {
        imports[match[1]!] = resolveImport(match[2]!);
    }

    const found: Route[] = [];
    for (const match of code.matchAll(/\.(get|post|put|patch|delete)\(\s*"([^"]+)"/g)) {
        found.push({ method: match[1]!.toUpperCase(), path: join(prefix, match[2]!) });
    }
    for (const match of code.matchAll(/\.use\(\s*"([^"]+)"\s*,\s*(\w+)\s*\)/g)) {
        const mounted = imports[match[2]!];
        if (mounted) found.push(...routesOf(mounted, join(prefix, match[1]!)));
    }
    return found;
}

/** Every route the API serves, as `{ method, path }` with Express-style params (":id"). */
export function listRoutes(): Route[] {
    return routesOf(path.join(src, "app.ts"), "");
}
