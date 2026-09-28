// Repro: already signed in, open /sign-in, click Google. Creates and deletes a throwaway Clerk user.
import { chromium } from "playwright";
import { readFileSync } from "node:fs";
const env = readFileSync("C:/Users/Rnf-user.DESKTOP-H20A3J8/Desktop/social_agent/apps/web/.env.local", "utf8");
const key = env.match(/^CLERK_SECRET_KEY=(.*)$/m)[1].trim().replace(/^"|"$/g, "");
const api = (path, init = {}) => fetch("https://api.clerk.com/v1" + path, { ...init, headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" } }).then((r) => r.json());
const email = `probe+${Date.now()}@example.com`, password = "Probe-pass-" + Date.now();
const user = await api("/users", { method: "POST", body: JSON.stringify({ email_address: [email], password, skip_password_checks: true }) });
if (!user.id) { console.log("create failed", JSON.stringify(user.errors?.[0]?.code)); process.exit(1); }
const b = await chromium.launch(); const p = await (await b.newContext()).newPage();
const logs = []; p.on("console", (m) => logs.push(m.type() + ": " + m.text().slice(0, 160)));
try {
  await p.goto("http://localhost:3000/sign-in", { waitUntil: "networkidle", timeout: 90000 });
  await p.fill("#email", email); await p.fill("#password", password);
  await p.getByRole("button", { name: "Sign in", exact: true }).click();
  await p.waitForTimeout(8000); console.log("after password:", new URL(p.url()).pathname);
  await p.goto("http://localhost:3000/sign-in", { waitUntil: "networkidle", timeout: 90000 });
  console.log("signed-in visit to /sign-in:", new URL(p.url()).pathname);
  const g = p.getByRole("button", { name: "Continue with Google" });
  if (await g.count()) { await g.click(); await p.waitForTimeout(6000); const u = new URL(p.url()); console.log("after Google click:", u.host + u.pathname); }
  console.log("alerts:", await p.locator("[role=alert]").allInnerTexts());
  console.log(logs.filter((l) => /error|warn|PROBE/i.test(l)).slice(0, 6));
} finally { await b.close(); await api(`/users/${user.id}`, { method: "DELETE" }); console.log("probe user deleted"); }
