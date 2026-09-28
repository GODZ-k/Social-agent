// Opens every wave 1 route and dialog once and reports whether it really works.
import { chromium } from "playwright";
const BASE = "http://localhost:3000";
const K = "/c/kiln-and-clay", T = "/c/tartine-bakery";
const dialog = (p) => p.locator("[role=dialog], [role=alertdialog]").first().waitFor({ state: "visible", timeout: 15000 });
const firstHref = async (p, re) => (await p.locator("a[href]").evaluateAll((as, src) => as.map((a) => a.getAttribute("href")).filter((h) => new RegExp(src).test(h)), re.source))[0];
const CHECKS = [
  ["admin clients", "/admin/clients"],
  ["admin invite dialog", "/admin/clients?invite=1", dialog],
  ["admin needs-you filter", "/admin/clients?filter=needs-you"],
  ["admin client detail", "/admin/clients/user_priya"],
  ["admin add brand dialog", "/admin/clients/user_priya", async (p) => { await p.getByRole("button", { name: /Add a brand/ }).first().click(); await dialog(p); }],
  ["admin settings link", "/admin/settings"],
  ["obs overview", "/admin/observability"], ["obs agents", "/admin/observability/agents"],
  ["obs server", "/admin/observability/server"], ["obs frontend", "/admin/observability/frontend"],
  ["obs 7 days", "/admin/observability?range=7d"],
  ["obs run detail", "/admin/observability/agents", async (p) => { const h = await firstHref(p, /\/admin\/observability\/agents\/[^?]+/); if (!h) throw new Error("no run link"); await p.goto(BASE + h, { waitUntil: "networkidle" }); }],
  ["obs error detail", "/admin/observability/frontend/fe_chunk_load"],
  ["overview", T], ["overview (kiln)", K],
  ["agent chat", T, async (p) => { await p.getByRole("button", { name: /Ask the agent/ }).first().click(); await dialog(p); }],
  ["content", `${K}/content`],
  ["content post panel", `${K}/content`, async (p) => { const h = await firstHref(p, /\?post=/); if (!h) throw new Error("no post link"); await p.goto(new URL(h, BASE + `${K}/content`).href, { waitUntil: "networkidle" }); await dialog(p); }],
  ["approvals", `${K}/approvals`],
  ["review post sheet", `${K}/approvals`, async (p) => { const h = await firstHref(p, /\?post=/); if (!h) throw new Error("no Edit post link"); await p.goto(new URL(h, BASE + `${K}/approvals`).href, { waitUntil: "networkidle" }); await dialog(p); }],
  ["viewer", `${K}/approvals`, async (p) => { await p.getByRole("button", { name: /See all slides full size/ }).first().click(); await dialog(p); }],
  ["approvals ask dialog (E key)", `${K}/approvals`, async (p) => { await p.keyboard.press("e"); await dialog(p); }],
  ["strategy (draft)", `${T}/strategy`], ["strategy (active)", `${K}/strategy`],
  ["strategy ask dialog", `${T}/strategy?ask=1`, dialog],
  ["research", `${T}/strategy/research`],
  ["onboarding", "/onboarding"], ["onboarding questionnaire", "/onboarding?clientId=meow-meow-tweet"],
  ["brands list /", "/"],
];
const AUTH = ["/sign-in", "/sign-up", "/verify", "/forgot-password", "/reset-password", "/invite", "/two-factor", "/two-factor/lost-access"];
const bad = (t) => /This didn.t load|Not Found|could not be found|Internal Server Error|Unhandled Runtime Error|Application error/i.test(t.slice(0, 4000));
async function run(ctx, name, path, act) {
  const p = await ctx.newPage(); const errs = [];
  p.on("console", (m) => { if (m.type() === "error" && !/favicon|development keys|Download the React DevTools/.test(m.text())) errs.push(m.text().split("\n")[0].slice(0, 140)); });
  p.on("pageerror", (e) => errs.push("pageerror: " + e.message.slice(0, 140)));
  let res = "OK";
  try {
    const r = await p.goto(BASE + path, { waitUntil: "networkidle", timeout: 120000 });
    if (act) await act(p);
    await p.waitForTimeout(800);
    const url = new URL(p.url()).pathname; const text = await p.locator("body").innerText();
    if (r && r.status() >= 400) res = `HTTP ${r.status()}`;
    else if (/\/(sign-in|two-factor\/setup)/.test(url) && !path.startsWith(url)) res = "REDIRECT " + url;
    else if (bad(text)) res = "ERROR PAGE";
  } catch (e) { res = "FAIL " + e.message.split("\n")[0].slice(0, 100); }
  console.log(`${res.padEnd(12)} ${name}${errs.length ? "  | console: " + errs.slice(0, 2).join(" || ") : ""}`);
  await p.close();
}
const b = await chromium.launch();
const admin = await b.newContext({ storageState: "owner-state.json", viewport: { width: 1440, height: 900 } });
for (const [n, path, act] of CHECKS) await run(admin, n, path, act);
const anon = await b.newContext({ viewport: { width: 1440, height: 900 } });
for (const path of AUTH) await run(anon, "auth " + path, path);
await b.close();
