// Fails when the API has a route that the Postman collection does not cover.
// Run: pnpm --filter api run postman:check
//
// It reads the Express routers under src/ (app.ts and src/routes/*.route.ts), follows every
// `.use("/prefix", someRoute)` mount, and looks for a collection request with the same method and path.
// It understands the plain style this API uses: `router.get("/path", ...)` and default-imported routers.
const fs = require("fs");
const path = require("path");

const src = path.join(__dirname, "..", "src");
const collection = JSON.parse(fs.readFileSync(path.join(__dirname, "cadence-api.postman_collection.json"), "utf8"));

/** "@/routes/me.route" -> absolute file path */
const resolveImport = (spec) => path.join(src, spec.replace(/^@\//, "").replace(/^\.\//, "")) + ".ts";

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

const join = (a, b) => ("/" + [a, b].join("/")).replace(/\/+/g, "/").replace(/(.)\/$/, "$1");

function collectionRequests(items, out = []) {
  for (const item of items) {
    if (item.item) collectionRequests(item.item, out);
    else out.push({ method: item.request.method, path: "/" + item.request.url.path.join("/") });
  }
  return out;
}

/** A route segment ":id" matches any one segment of a request path ("{{brandId}}" or a literal). */
function covers(route, request) {
  if (route.method !== request.method) return false;
  const a = route.path.split("/");
  const b = request.path.split("/");
  return a.length === b.length && a.every((segment, i) => segment.startsWith(":") || segment === b[i]);
}

const routes = routesOf(path.join(src, "app.ts"), "");
const requests = collectionRequests(collection.item);
const missing = routes.filter((route) => !requests.some((request) => covers(route, request)));

console.log(`${routes.length} routes in the API, ${requests.length} requests in the collection.`);
if (missing.length > 0) {
  console.error("\nNot in the Postman collection yet:");
  for (const route of missing) console.error(`  ${route.method} ${route.path}`);
  console.error("\nAdd a request for each in postman/build-collection.cjs, then run: pnpm --filter api run postman");
  process.exit(1);
}
console.log("Every route has a Postman request.");
