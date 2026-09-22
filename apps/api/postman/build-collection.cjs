// The source of cadence-api.postman_collection.json. Never edit the JSON by hand: it is overwritten.
//
// WHEN YOU ADD OR CHANGE AN ENDPOINT
// 1. Add (or edit) a `request({ ... })` entry in the right folder below: a demo input, a description
//    saying which fields are required, a test for the status code, and one saved example per
//    response the endpoint can give (the success and each error code it throws).
// 2. Run: pnpm --filter api run postman
// 3. In Postman, re-import the JSON file (Import > choose the file > Replace).
const fs = require("fs");
const path = require("path");

const out = process.argv[2] || path.join(__dirname, "cadence-api.postman_collection.json");

const USER_ID = "7d1f0c6e-2a8b-4a63-9a57-0f2f1b6d3c11";
const ADMIN_ID = "1a2b3c4d-0000-4000-8000-aaaaaaaaaaaa";
const BRAND_ID = "b3c1f1de-5e0a-4f0e-8f65-6d1f4a2c9e77";
const BRAND2_ID = "c9a4e2b0-1d3f-4b7a-9c21-8e5f6a7b0d12";
const INVITED_ID = "e4f5a6b7-c8d9-4e0f-a1b2-c3d4e5f6a7b8";
const SCAN_ID = "d4e5f6a7-b8c9-4d0e-9f1a-2b3c4d5e6f70";

// ---------------------------------------------------------------- demo data
const brandKit = {
  tagline: "Small-batch bakes, made before sunrise",
  summary: "A neighbourhood bakery in Pune selling sourdough, croissants and custom cakes.",
  audience: "Office workers and young families within 5 km",
  voice: ["warm", "direct", "a little playful"],
  colors: [
    { name: "Espresso", hex: "#3B2F2F" },
    { name: "Butter", hex: "#F4E1B5" },
  ],
  fonts: { heading: "Fraunces", body: "Inter" },
  aesthetic: "earthy, close-up food shots, lots of natural light",
  keywords: ["sourdough", "bakery pune", "custom cakes"],
};

const business = {
  phone: "+91 98765 43210",
  email: "hello@crumbandco.com",
  location: { address: "12 Lane 5, Koregaon Park", city: "Pune", region: "Maharashtra", country: "India" },
  hours: [
    { day: "mon", open: "07:00", close: "19:00" },
    { day: "sat", open: "08:00", close: "21:00" },
  ],
};

const newBrandBody = {
  name: "Crumb & Co",
  url: "crumbandco.com",
  industry: "Bakery",
  brand: brandKit,
  platforms: ["instagram", "linkedin", "tiktok"],
  business,
};

/**
 * Same as `newBrandBody`, but with the optional `scanId` a real onboarding flow would send after
 * a scan finishes. `SCAN_ID` is a demo id, not a real scan, so sending this as-is answers 404
 * SCAN_NOT_FOUND - that is the point of the request that uses it. Swap in a real scan's id (see
 * the Scans folder) to see 201 (done scan) or 409 (still queued/running) instead.
 */
const newBrandBodyWithScan = { ...newBrandBody, scanId: SCAN_ID };

const secondBrandBody = {
  name: "Crumb & Co Catering",
  url: "https://catering.crumbandco.com",
  industry: "Catering",
  brand: { ...brandKit, tagline: "Office breakfasts, sorted", colors: [{ name: "Olive", hex: "#5B6B3A" }] },
  platforms: ["linkedin"],
};

const emptyStats = {
  followers: 0,
  followersDelta: 0,
  engagementRate: 0,
  engagementDelta: 0,
  scheduled: 0,
  pendingApprovals: 0,
};

const brand = (over = {}) => ({
  id: BRAND_ID,
  ownerId: USER_ID,
  createdBy: USER_ID,
  name: "Crumb & Co",
  url: "https://crumbandco.com",
  industry: "Bakery",
  accent: "#3B2F2F",
  stage: "onboarding",
  brand: brandKit,
  business,
  platforms: ["instagram", "linkedin", "tiktok"],
  preferences: { timezone: "UTC", approvalEmails: true },
  createdAt: "2026-09-20T16:40:12.345Z",
  accounts: [],
  stats: emptyStats,
  ...over,
});

const brand2 = brand({
  id: BRAND2_ID,
  name: "Crumb & Co Catering",
  url: "https://catering.crumbandco.com",
  industry: "Catering",
  accent: "#5B6B3A",
  brand: secondBrandBody.brand,
  business: {},
  platforms: ["linkedin"],
  createdAt: "2026-09-20T16:42:50.101Z",
});

const me = {
  id: USER_ID,
  email: "owner@crumbandco.com",
  name: "Asha Kulkarni",
  imageUrl: "https://img.clerk.com/demo-avatar",
  role: "client",
  createdAt: "2026-09-20T10:15:00.000Z",
};

const invitedClient = {
  id: INVITED_ID,
  email: "new.person@example.com",
  name: "New Person",
  imageUrl: null,
  phone: "+91 90000 11111",
  status: "invited",
  brandCount: 0,
  createdAt: "2026-09-20T17:05:00.000Z",
};

const scanPages = [
  { url: "https://crumbandco.com", title: "Crumb & Co - Small-batch bakery in Pune" },
  { url: "https://crumbandco.com/about", title: "About us" },
  { url: "https://crumbandco.com/menu", title: "Menu" },
];

/** What a finished scan proposes: the same brand kit and business demo data used above. */
const scanResult = { name: "Crumb & Co", industry: "Bakery", brand: brandKit, business };

const scan = (over = {}) => ({
  id: SCAN_ID,
  brandId: null,
  url: "https://crumbandco.com",
  status: "queued",
  currentStep: null,
  pages: [],
  result: null,
  error: null,
  startedAt: null,
  finishedAt: null,
  createdAt: "2026-09-22T09:00:00.000Z",
  ...over,
});

const ok = (data) => ({ success: true, data });
const fail = (code, message, details) => ({ success: false, error: { code, message, ...(details && { details }) } });

// ---------------------------------------------------------------- builders
const urlOf = (p) => {
  const clean = p.replace(/^\//, "");
  return { raw: `{{baseUrl}}/${clean}`, host: ["{{baseUrl}}"], path: clean.split("/") };
};

function request({ name, method, p, body, description, headers = [], noAuth = false, tests, examples = [] }) {
  const req = {
    method,
    header: [...headers],
    url: urlOf(p),
    description,
  };
  if (body !== undefined) {
    req.header.push({ key: "Content-Type", value: "application/json" });
    req.body = { mode: "raw", raw: typeof body === "string" ? body : JSON.stringify(body, null, 2), options: { raw: { language: "json" } } };
  }
  if (noAuth) req.auth = { type: "noauth" };

  const item = { name, request: req, response: [] };
  if (tests) item.event = [{ listen: "test", script: { type: "text/javascript", exec: tests } }];

  for (const ex of examples) {
    item.response.push({
      name: ex.name,
      originalRequest: JSON.parse(JSON.stringify(req)),
      status: ex.statusText,
      code: ex.code,
      _postman_previewlanguage: ex.body === undefined ? "text" : "json",
      header: ex.body === undefined ? [] : [{ key: "Content-Type", value: "application/json; charset=utf-8" }],
      body: ex.body === undefined ? "" : JSON.stringify(ex.body, null, 2),
    });
  }
  return item;
}

const expectStatus = (code) => [`pm.test("status is ${code}", function () { pm.response.to.have.status(${code}); });`];
const actAs = (who) => [{ key: "X-Act-As", value: who, description: "Read only by this collection's pre-request script: which Clerk user to mint the token for." }];

// ---------------------------------------------------------------- pre-request script (mints a Clerk token)
const preRequest = `
// Mints a fresh Clerk session token before every /api/v1 request, so you never paste tokens by hand.
// Works only while the API runs with NODE_ENV=development (see apps/api/AGENTS.md).
//
// Variables (read from the ACTIVE ENVIRONMENT first, then from this collection's variables):
//   clerk_secret_key      - CLERK_SECRET_KEY from apps/api/.env. Keep it in CURRENT VALUE only.
//   clerk_user_id         - Clerk id (user_...) used for every request
//   clerk_admin_user_id   - optional: used for /admin/ requests instead of clerk_user_id
//   clerk_client_user_id  - optional: used for all other requests instead of clerk_user_id
// A request can force one with the header  X-Act-As: admin | client.
const read = function (name) { return pm.environment.get(name) || pm.collectionVariables.get(name); };
const url = pm.request.url.toString();

if (url.indexOf("/api/v1") !== -1) { // /health needs no token
    const forced = pm.request.headers.get("X-Act-As");
    const who = forced || (url.indexOf("/admin/") !== -1 || /\\/admin$/.test(url) ? "admin" : "client");
    const secret = read("clerk_secret_key");
    const userId = read("clerk_" + who + "_user_id") || read("clerk_user_id");

    if (!secret || !userId) {
        console.error("Token not minted: set clerk_secret_key and clerk_user_id in the active environment.");
    } else {
        const headers = { Authorization: "Bearer " + secret, "Content-Type": "application/json" };

        // 1. Create a session for the user.
        pm.sendRequest({
            url: "https://api.clerk.com/v1/sessions",
            method: "POST",
            header: headers,
            body: { mode: "raw", raw: JSON.stringify({ user_id: userId }) },
        }, function (err, res) {
            if (err || res.code >= 400) {
                console.error("Clerk session failed. Check clerk_secret_key and the user id.", err || res.text());
                return;
            }

            // 2. Ask that session for a token.
            pm.sendRequest({
                url: "https://api.clerk.com/v1/sessions/" + res.json().id + "/tokens",
                method: "POST",
                header: headers,
            }, function (err2, res2) {
                if (err2 || res2.code >= 400) {
                    console.error("Clerk token failed.", err2 || res2.text());
                    return;
                }

                // An environment variable wins over a collection variable of the same name, so a stale
                // token in the environment would hide a fresh one in the collection. Set both.
                const jwt = res2.json().jwt;
                pm.environment.set("token", jwt);
                pm.collectionVariables.set("token", jwt);
                console.log("Clerk token minted for the " + who + " user " + userId);
            });
        });
    }
}
`.trim().split("\n");

// ---------------------------------------------------------------- requests
const health = {
  name: "0. Health (no token)",
  item: [
    request({
      name: "Health check",
      method: "GET",
      p: "/health",
      noAuth: true,
      description: "Is the API up, and can it reach the database? 200 when healthy, 503 when the database is down.",
      tests: expectStatus(200),
      examples: [
        { name: "200 healthy", code: 200, statusText: "OK", body: ok({ status: "healthy", database: "up", timestamp: "2026-09-20T16:30:00.000Z" }) },
        { name: "503 database down", code: 503, statusText: "Service Unavailable", body: { success: false, data: { status: "unhealthy", database: "down", timestamp: "2026-09-20T16:30:00.000Z" } } },
      ],
    }),
    request({
      name: "Test error (shows the error body shape)",
      method: "GET",
      p: "/health/test-error",
      noAuth: true,
      description: "A developer tool. Always answers 400, so you can see what every error from this API looks like.",
      tests: expectStatus(400),
      examples: [{ name: "400 test error", code: 400, statusText: "Bad Request", body: fail("TEST_ERROR", "This is a test error") }],
    }),
  ],
};

const meFolder = {
  name: "1. Me",
  item: [
    request({
      name: "My account",
      method: "GET",
      p: "/api/v1/me",
      description: "The signed-in person. `id` is our own user id, not Clerk's. The first call creates the `users` row (or links an invited one).",
      tests: expectStatus(200),
      examples: [
        { name: "200", code: 200, statusText: "OK", body: ok(me) },
        { name: "401 no or bad token", code: 401, statusText: "Unauthorized", body: fail("UNAUTHENTICATED", "Sign in to continue.") },
        { name: "409 email belongs to another row", code: 409, statusText: "Conflict", body: fail("EMAIL_IN_USE", "This email already belongs to another account. Verify your email address, then try again.") },
      ],
    }),
    request({
      name: "My overview (account + my brands)",
      method: "GET",
      p: "/api/v1/me/overview",
      description: "Everything the app needs on start-up, in one call. `brands` is what this person owns (even for an admin). An empty list means they have not onboarded yet.",
      tests: [
        ...expectStatus(200),
        `pm.test("counts.brands matches the list", function () { const d = pm.response.json().data; pm.expect(d.counts.brands).to.eql(d.brands.length); });`,
      ],
      examples: [
        { name: "200 with two brands", code: 200, statusText: "OK", body: ok({ user: me, brands: [brand2, brand()], counts: { brands: 2 } }) },
        { name: "200 not onboarded yet", code: 200, statusText: "OK", body: ok({ user: me, brands: [], counts: { brands: 0 } }) },
      ],
    }),
  ],
};

const brandsFolder = {
  name: "2. Brands (run top to bottom)",
  description: "A client sees only their own brands. An admin sees every brand. \"Missing\", \"archived\" and \"not yours\" all answer 404, so nobody can probe for ids.",
  item: [
    request({
      name: "Create a brand",
      method: "POST",
      p: "/api/v1/brands",
      body: newBrandBody,
      description: "Required: name, url, industry, brand (the brand kit), platforms. Optional: business, and `aesthetic` / `keywords` inside brand.\n\n`url` may be typed without https://; the API adds it. `accent` is taken from the first brand colour. The caller becomes both `ownerId` and `createdBy`.\n\nSaves the new id into the `brandId` variable for the next requests.",
      tests: [
        ...expectStatus(201),
        `const d = pm.response.json().data;`,
        `pm.collectionVariables.set("brandId", d.id);`,
        `pm.test("owner created it", function () { pm.expect(d.createdBy).to.eql(d.ownerId); });`,
        `pm.test("https:// was added", function () { pm.expect(d.url).to.eql("https://crumbandco.com"); });`,
      ],
      examples: [{ name: "201 created", code: 201, statusText: "Created", body: ok(brand()) }],
    }),
    request({
      name: "Create a brand from a scan - demo id, so 404 (needs a real done scan)",
      method: "POST",
      p: "/api/v1/brands",
      body: newBrandBodyWithScan,
      description: "Same body as \"Create a brand\", plus the optional `scanId`: the onboarding scan this brand kit came from. The scan must be `done` and requested by the caller (or the caller is admin); the API then sets `brand_scans.brand_id` to the new brand.\n\n`SCAN_ID` here is a demo id that does not exist, so this answers 404 as written. Start a real scan in the Scans folder, wait for it to be `done`, and replace `scanId` with its id to see 201; while it is still `queued`/`running` you would see 409 instead.",
      tests: expectStatus(404),
      examples: [
        { name: "201 created (with a real, done scan's id)", code: 201, statusText: "Created", body: ok(brand()) },
        { name: "409 the scan hasn't finished yet", code: 409, statusText: "Conflict", body: fail("SCAN_NOT_DONE", "This scan hasn't finished yet.") },
        { name: "404 missing, not yours, or a demo id like this one", code: 404, statusText: "Not Found", body: fail("SCAN_NOT_FOUND", "This scan doesn't exist, or you don't have access to it.") },
      ],
    }),
    request({
      name: "Create a second brand (a client can own several)",
      method: "POST",
      p: "/api/v1/brands",
      body: secondBrandBody,
      description: "There is no limit on brands per client. `business` is left out here, so it comes back as {}.",
      tests: expectStatus(201),
      examples: [{ name: "201 created", code: 201, statusText: "Created", body: ok(brand2) }],
    }),
    request({
      name: "Create a brand - invalid body",
      method: "POST",
      p: "/api/v1/brands",
      body: { name: "", url: "not a website", industry: "Bakery", brand: { ...brandKit, colors: [{ name: "Bad", hex: "brown" }] }, platforms: ["myspace"] },
      description: "Shows the validation error. `details` lists every wrong field with its path.",
      tests: expectStatus(400),
      examples: [
        {
          name: "400 validation error",
          code: 400,
          statusText: "Bad Request",
          body: fail("VALIDATION_ERROR", "Some fields are invalid.", [
            { path: "name", message: "Too small: expected string to have >=1 characters" },
            { path: "url", message: "Enter a website address such as acme.com" },
            { path: "brand.colors.0.hex", message: "Use a hex colour such as #3B2F2F" },
            { path: "platforms.0", message: "Invalid option: expected one of \"instagram\"|\"facebook\"|\"linkedin\"|\"tiktok\"" },
          ]),
        },
      ],
    }),
    request({
      name: "List brands",
      method: "GET",
      p: "/api/v1/brands",
      description: "Newest first. A client gets their own brands; an admin gets all of them (add the header X-Act-As: admin to try). Archived brands are never listed.",
      tests: expectStatus(200),
      examples: [{ name: "200", code: 200, statusText: "OK", body: ok([brand2, brand()]) }],
    }),
    request({
      name: "Get one brand",
      method: "GET",
      p: "/api/v1/brands/{{brandId}}",
      tests: expectStatus(200),
      description: "Input: the brand id in the path.",
      examples: [
        { name: "200", code: 200, statusText: "OK", body: ok(brand()) },
        { name: "404 missing, archived or not yours", code: 404, statusText: "Not Found", body: fail("BRAND_NOT_FOUND", "This brand doesn't exist, or you don't have access to it.") },
      ],
    }),
    request({
      name: "Update a brand",
      method: "PATCH",
      p: "/api/v1/brands/{{brandId}}",
      body: {
        name: "Crumb & Co Bakery",
        platforms: ["instagram", "tiktok"],
        preferences: { timezone: "Asia/Kolkata", approvalEmails: false },
        business: { ...business, phone: "+91 91111 22222" },
      },
      description: "Every field is optional: name, industry, brand, business, platforms, preferences. Send only what changes. Unknown fields (such as `url`, `stage`, `ownerId`) are dropped, so they cannot be changed here. Sending `brand` also updates `accent`.",
      tests: [...expectStatus(200), `pm.test("name changed", function () { pm.expect(pm.response.json().data.name).to.eql("Crumb & Co Bakery"); });`],
      examples: [
        {
          name: "200 updated",
          code: 200,
          statusText: "OK",
          body: ok(brand({
            name: "Crumb & Co Bakery",
            platforms: ["instagram", "tiktok"],
            preferences: { timezone: "Asia/Kolkata", approvalEmails: false },
            business: { ...business, phone: "+91 91111 22222" },
          })),
        },
      ],
    }),
    request({
      name: "Archive a brand (DELETE)",
      method: "DELETE",
      p: "/api/v1/brands/{{brandId}}",
      description: "Brands are never deleted: this sets `archived_at`. The brand disappears from every list and answers 404 afterwards, but its row and history stay in the database. No response body.",
      tests: expectStatus(204),
      examples: [{ name: "204 archived (empty body)", code: 204, statusText: "No Content" }],
    }),
    request({
      name: "Get the archived brand - now 404",
      method: "GET",
      p: "/api/v1/brands/{{brandId}}",
      description: "Run after the archive request.",
      tests: expectStatus(404),
      examples: [{ name: "404", code: 404, statusText: "Not Found", body: fail("BRAND_NOT_FOUND", "This brand doesn't exist, or you don't have access to it.") }],
    }),
    request({
      name: "List brands - no token",
      method: "GET",
      p: "/api/v1/brands",
      noAuth: true,
      description: "Everything under /api/v1 needs a signed-in user.",
      tests: expectStatus(401),
      examples: [{ name: "401", code: 401, statusText: "Unauthorized", body: fail("UNAUTHENTICATED", "Sign in to continue.") }],
    }),
  ],
};

const scansFolder = {
  name: "3. Scans (run top to bottom)",
  description:
    "Onboarding: enter a URL, scan it, review the proposed brand kit, then create the brand from it (Brands folder, \"Create a brand from a scan\"). A scan runs in an in-process queue, one at a time; a person has at most one queued or running scan. Reachable by the requester, or an admin.",
  item: [
    request({
      name: "Start a scan",
      method: "POST",
      p: "/api/v1/scans",
      body: { url: "donangie.com" },
      description: "Required: url (same rule as a brand's `url`; \"https://\" is added if missing). Queues a website scan and answers at once; the scan itself runs in the background through `discover → read-pages → interpret → report`. Poll \"Get a scan\" until `status` is `done` or `failed`.\n\nIf the caller already has a scan `queued` or `running`, that same scan comes back with 200 instead of starting a second one (a double click must not spend two Firecrawl calls).\n\nSaves the id into the `scanId` variable for the next request.",
      tests: [
        `pm.test("status is 202 or 200", function () { pm.expect([200, 202]).to.include(pm.response.code); });`,
        `const d = pm.response.json().data;`,
        `pm.collectionVariables.set("scanId", d.id);`,
      ],
      examples: [
        { name: "202 queued", code: 202, statusText: "Accepted", body: ok(scan()) },
        {
          name: "200 already running (a double click, or a reload)",
          code: 200,
          statusText: "OK",
          body: ok(scan({ status: "running", currentStep: "read-pages", startedAt: "2026-09-22T09:00:01.000Z" })),
        },
        {
          name: "400 validation error",
          code: 400,
          statusText: "Bad Request",
          body: fail("VALIDATION_ERROR", "Some fields are invalid.", [{ path: "url", message: "Enter a website address such as acme.com" }]),
        },
      ],
    }),
    request({
      name: "Get a scan",
      method: "GET",
      p: "/api/v1/scans/{{scanId}}",
      description: "Poll every 1-2 seconds until `status` is `done` or `failed`. Input: the scan id in the path. Who: the requester, or admin.\n\nWhen `done`, `result` is a `ScanResult` (`{ name?, industry?, brand, business? }`) the person reviews before \"Create a brand from a scan\". When `failed`, `error` is a plain sentence to show as-is.",
      tests: expectStatus(200),
      examples: [
        {
          name: "200 running",
          code: 200,
          statusText: "OK",
          body: ok(scan({ status: "running", currentStep: "read-pages", startedAt: "2026-09-22T09:00:01.000Z" })),
        },
        {
          name: "200 done",
          code: 200,
          statusText: "OK",
          body: ok(
            scan({
              status: "done",
              pages: scanPages,
              result: scanResult,
              startedAt: "2026-09-22T09:00:01.000Z",
              finishedAt: "2026-09-22T09:00:42.000Z",
            }),
          ),
        },
        {
          name: "200 failed",
          code: 200,
          statusText: "OK",
          body: ok(
            scan({
              status: "failed",
              error: "We can only read public websites. Check the address and try again.",
              startedAt: "2026-09-22T09:00:01.000Z",
              finishedAt: "2026-09-22T09:00:05.000Z",
            }),
          ),
        },
        { name: "404 missing or not yours", code: 404, statusText: "Not Found", body: fail("SCAN_NOT_FOUND", "This scan doesn't exist, or you don't have access to it.") },
      ],
    }),
  ],
};

const adminFolder = {
  name: "4. Admin (run top to bottom)",
  description: "Only for a user whose role is admin. Here \"clients\" are people (business owners), not brands.",
  item: [
    request({
      name: "List clients - as a normal client (forbidden)",
      method: "GET",
      p: "/api/v1/admin/clients",
      headers: actAs("client"),
      description: "Proves a non-admin cannot reach the admin routes.",
      tests: expectStatus(403),
      examples: [{ name: "403", code: 403, statusText: "Forbidden", body: fail("FORBIDDEN", "Only an admin can do this.") }],
    }),
    request({
      name: "Invite a client",
      method: "POST",
      p: "/api/v1/admin/clients",
      body: { email: "New.Person@Example.com", name: "New Person", phone: "+91 90000 11111" },
      description: "Required: email. Optional: name, phone.\n\nCreates the person before they have an account (`status: invited`) and has Clerk send them a REAL invitation email, so use an address you own. The email is stored lowercase. When they sign up with that email (verified), their account links to this row.\n\nSaves the new id into the `clientId` variable.",
      tests: [
        ...expectStatus(201),
        `const d = pm.response.json().data;`,
        `pm.collectionVariables.set("clientId", d.id);`,
        `pm.test("email is lowercase", function () { pm.expect(d.email).to.eql(d.email.toLowerCase()); });`,
        `pm.test("status is invited", function () { pm.expect(d.status).to.eql("invited"); });`,
      ],
      examples: [
        { name: "201 invited", code: 201, statusText: "Created", body: ok(invitedClient) },
        { name: "502 Clerk could not send the email (the row is removed again)", code: 502, statusText: "Bad Gateway", body: fail("INVITE_FAILED", "The invitation email could not be sent. Try again.") },
      ],
    }),
    request({
      name: "Invite the same email again (conflict)",
      method: "POST",
      p: "/api/v1/admin/clients",
      body: { email: "new.person@example.com" },
      description: "An email can exist only once, whether the person is invited or active.",
      tests: expectStatus(409),
      examples: [{ name: "409", code: 409, statusText: "Conflict", body: fail("CLIENT_EXISTS", "Someone with this email is already here.") }],
    }),
    request({
      name: "Invite a client - invalid email",
      method: "POST",
      p: "/api/v1/admin/clients",
      body: { email: "nope" },
      tests: expectStatus(400),
      description: "Validation error example.",
      examples: [{ name: "400", code: 400, statusText: "Bad Request", body: fail("VALIDATION_ERROR", "Some fields are invalid.", [{ path: "email", message: "Invalid email address" }]) }],
    }),
    request({
      name: "Create a brand for a client",
      method: "POST",
      p: "/api/v1/admin/clients/{{clientId}}/brands",
      body: newBrandBody,
      description: "Same body as POST /brands. The CLIENT becomes `ownerId`; `createdBy` is the admin. Works even while the client is still `invited`, so their workspace is ready when they first sign in.",
      tests: [
        ...expectStatus(201),
        `const d = pm.response.json().data;`,
        `pm.test("the client owns it", function () { pm.expect(d.ownerId).to.eql(pm.collectionVariables.get("clientId")); });`,
        `pm.test("the admin created it", function () { pm.expect(d.createdBy).to.not.eql(d.ownerId); });`,
      ],
      examples: [
        { name: "201 created", code: 201, statusText: "Created", body: ok(brand({ ownerId: INVITED_ID, createdBy: ADMIN_ID })) },
        { name: "404 no such client", code: 404, statusText: "Not Found", body: fail("CLIENT_NOT_FOUND", "This client doesn't exist.") },
      ],
    }),
    request({
      name: "Create a brand for a client from a scan - demo id, so 404 (needs a real done scan)",
      method: "POST",
      p: "/api/v1/admin/clients/{{clientId}}/brands",
      body: newBrandBodyWithScan,
      description: "Same body as \"Create a brand for a client\", plus the optional `scanId` (same rule as POST /brands: the scan must be `done`; an admin may claim any scan, not only ones the client requested).\n\n`SCAN_ID` here is a demo id that does not exist, so this answers 404 as written. Replace `scanId` with a real, done scan's id to see 201, or a still-queued/running one to see 409.",
      tests: expectStatus(404),
      examples: [
        { name: "201 created (with a real, done scan's id)", code: 201, statusText: "Created", body: ok(brand({ ownerId: INVITED_ID, createdBy: ADMIN_ID })) },
        { name: "409 the scan hasn't finished yet", code: 409, statusText: "Conflict", body: fail("SCAN_NOT_DONE", "This scan hasn't finished yet.") },
        { name: "404 missing, or a demo id like this one", code: 404, statusText: "Not Found", body: fail("SCAN_NOT_FOUND", "This scan doesn't exist, or you don't have access to it.") },
      ],
    }),
    request({
      name: "Get one client with their brands",
      method: "GET",
      p: "/api/v1/admin/clients/{{clientId}}",
      description: "Input: the client's user id in the path. `brandCount` and `brands` leave out archived brands.",
      tests: [...expectStatus(200), `pm.test("brandCount matches", function () { const d = pm.response.json().data; pm.expect(d.client.brandCount).to.eql(d.brands.length); });`],
      examples: [{ name: "200", code: 200, statusText: "OK", body: ok({ client: { ...invitedClient, brandCount: 1 }, brands: [brand({ ownerId: INVITED_ID, createdBy: ADMIN_ID })] }) }],
    }),
    request({
      name: "List clients",
      method: "GET",
      p: "/api/v1/admin/clients",
      description: "Every client, newest first, with how many live brands each owns. Admins are not clients, so they are not listed.",
      tests: expectStatus(200),
      examples: [
        {
          name: "200",
          code: 200,
          statusText: "OK",
          body: ok([
            { ...invitedClient, brandCount: 1 },
            { id: USER_ID, email: me.email, name: me.name, imageUrl: me.imageUrl, phone: null, status: "active", brandCount: 1, createdAt: me.createdAt },
          ]),
        },
      ],
    }),
    request({
      name: "Get one client - bad id",
      method: "GET",
      p: "/api/v1/admin/clients/not-a-uuid",
      description: "A malformed id is treated as \"not found\".",
      tests: expectStatus(404),
      examples: [{ name: "404", code: 404, statusText: "Not Found", body: fail("CLIENT_NOT_FOUND", "This client doesn't exist.") }],
    }),
  ],
};

const collection = {
  info: {
    name: "Cadence API (phase 1)",
    description:
      "Every endpoint the API has today: health, me, brands, scans and admin.\n\n" +
      "SET UP\n" +
      "1. Start the API: pnpm --filter api run dev (NODE_ENV must be development).\n" +
      "2. In your active environment (or this collection's Variables) set `clerk_secret_key` and `clerk_user_id`. For the Admin folder also set `clerk_admin_user_id` (an admin) and `clerk_client_user_id` (a normal user). Use CURRENT VALUE only, so the secret is never exported.\n" +
      "3. Run the folders top to bottom. Requests save `brandId`, `scanId` and `clientId` for the ones after them. The two \"...from a scan\" requests (one in Brands, one in Admin) use a demo `scanId` and answer 404 as written; swap in a real scan id from the Scans folder to see 201 or 409 instead.\n\n" +
      "The pre-request script mints a fresh Clerk token before each request. If you would rather paste a token, leave `clerk_secret_key` empty and set `token` yourself.\n\n" +
      "RESPONSES\n" +
      "Success: { \"success\": true, \"data\": ... }\n" +
      "Error:   { \"success\": false, \"error\": { \"code\", \"message\", \"details\"? } }\n" +
      "Each request has saved examples (the Examples dropdown) showing the expected output.\n\n" +
      "WORDS\nA client is a person (a business owner). A brand is a website workspace. A client can own several brands.",
    schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
  },
  auth: { type: "bearer", bearer: [{ key: "token", value: "{{token}}", type: "string" }] },
  event: [{ listen: "prerequest", script: { type: "text/javascript", exec: preRequest } }],
  variable: [
    { key: "baseUrl", value: "http://localhost:4000" },
    { key: "clerk_secret_key", value: "" },
    { key: "clerk_user_id", value: "" },
    { key: "clerk_admin_user_id", value: "" },
    { key: "clerk_client_user_id", value: "" },
    { key: "token", value: "" },
    { key: "brandId", value: "" },
    { key: "scanId", value: "" },
    { key: "clientId", value: "" },
  ],
  item: [health, meFolder, brandsFolder, scansFolder, adminFolder],
};

fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(collection, null, 2) + "\n");

const count = collection.item.reduce((n, f) => n + f.item.length, 0);
console.log(`wrote ${out}: ${collection.item.length} folders, ${count} requests`);
