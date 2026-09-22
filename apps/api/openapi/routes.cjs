// Reads the Express routers under src/ (app.ts and src/routes/*.route.ts) and returns every
// route the API serves, following each `.use("/prefix", someRoute)` mount.
//
// src/routes/docs.route.ts is imported dynamically in app.ts (not statically), so it never shows
// up here — see the comment above that import for why.
//
// Read by openapi/check.cjs so the check compares the real Express routes with the OpenAPI operations.
const fs = require("fs");
const path = require("path");

const src = path.join(__dirname, "..", "src");

/** "@/routes/me.route" -> absolute file path */
const resolveImport = (spec) => path.join(src, spec.replace(/^@\//, "").replace(/^\.\//, "")) + ".ts";

const join = (a, b) => ("/" + [a, b].join("/")).replace(/\/+/g, "/").replace(/(.)\/$/, "$1");

function routesOf(file, prefix) {
    const code = fs.readFileSync(file, "utf8");

    const imports = {};
    for (const m of code.matchAll(/import\s+(\w+)\s+from\s+"(@\/routes\/[^"]+|\.\/routes\/[^"]+)"/g)) imports[m[1]] = resolveImport(m[2]);

    const found = [];
    for (const m of code.matchAll(/\.(get|post|put|patch|delete)\(\s*"([^"]+)"/g)) {
        found.push({ method: m[1].toUpperCase(), path: join(prefix, m[2]) });
    }
    for (const m of code.matchAll(/\.use\(\s*"([^"]+)"\s*,\s*(\w+)\s*\)/g)) {
        if (imports[m[2]]) found.push(...routesOf(imports[m[2]], join(prefix, m[1])));
    }
    return found;
}

/** Every route the API serves, as `{ method, path }` with Express-style params (":id"). */
function listRoutes() {
    return routesOf(path.join(src, "app.ts"), "");
}

module.exports = { listRoutes };
