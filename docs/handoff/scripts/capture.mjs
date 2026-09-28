// Captures app pages with the owner's saved session, one page at a time, with checks.
import { chromium } from "playwright";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
const OUT = "../cmp/app"; mkdirSync(OUT, { recursive: true });
const BASE = "http://localhost:3000";
const WIDTHS = [[1440, 900], [768, 1024], [390, 844]];
const B = "/c/tartine-bakery";
const PAGES = [
  ["s03", B], ["s06", `${B}/content`],
  ["s07", `${B}/content`, async (p) => p.getByRole("radio", { name: /Needs approval/ }).or(p.getByRole("tab", { name: /Needs approval/ })).or(p.getByText(/^Needs approval/)).first().click()],
  ["s09", "/c/kiln-and-clay/approvals"],
  ["s08", "/c/kiln-and-clay/approvals", async (p) => { if (!globalThis.editHref) { await p.setViewportSize({ width: 1440, height: 900 }); await p.reload({ waitUntil: "networkidle" }); globalThis.editHref = await p.getByRole("link", { name: /Edit post/ }).first().getAttribute("href"); await p.setViewportSize({ width: p.__w, height: p.__h }); } await p.goto(new URL(globalThis.editHref, BASE + "/c/kiln-and-clay/approvals").href, { waitUntil: "networkidle" }); }],
  ["s10", "/c/kiln-and-clay/approvals", async (p) => { if (p.__w >= 1024) await p.getByRole("button", { name: /See all slides full size/ }).first().click(); else { await p.getByRole("button", { name: /Read the full post/ }).first().click().catch(() => p.keyboard.press(" ")); } }],
  ["s04", B, async (p) => p.getByRole("button", { name: /Ask the agent/ }).first().click()],
  ["s20", `${B}/strategy`], ["s20b", `${B}/strategy?ask=1`], ["s20c", "/c/kiln-and-clay/strategy"], ["s21", `${B}/strategy/research`],
  ["s01", "/onboarding"], ["s18", "/onboarding?clientId=meow-meow-tweet"],
  ["admin-clients", "/admin/clients"], ["admin-client-detail", "/admin/clients/user_priya"],
  ["obs-overview", "/admin/observability"], ["obs-agents", "/admin/observability/agents"],
  ["obs-server", "/admin/observability/server"], ["obs-frontend", "/admin/observability/frontend"],
];
const only = process.argv.slice(2);
const b = await chromium.launch();
const c = await b.newContext({ storageState: "owner-state.json" });
const p = await c.newPage();
const log = [];
for (const [id, path, act] of PAGES) {
  if (only.length && !only.includes(id)) continue;
  for (const [w, h] of WIDTHS) {
    let status = "ok";
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        await p.setViewportSize({ width: w, height: h }); p.__w = w; p.__h = h;
        await p.goto(BASE + path, { waitUntil: "networkidle", timeout: 120000 });
        if (act) { await act(p); await p.waitForTimeout(1500); }
        await p.waitForTimeout(800);
        const url = p.url(); const text = await p.locator("body").innerText();
        if (/\/(sign-in|two-factor)/.test(url)) status = "AUTH_REDIRECT " + new URL(url).pathname;
        else if (/Not Found|didn.t load|This page could not be found/i.test(text.slice(0, 3000))) status = "NOT_FOUND";
        else status = "ok";
        if (status === "ok") { await p.screenshot({ path: `${OUT}/${id}-${w}.png`, fullPage: true }); break; }
      } catch (e) { status = "ERROR " + String(e.message).split("\n")[0].slice(0, 120); }
    }
    log.push(`${id}-${w}: ${status}`); console.log(`${id}-${w}: ${status}`);
  }
}
await b.close();
const hashes = {};
for (const line of log.filter((l) => l.endsWith(": ok"))) { const f = line.split(":")[0]; const h = createHash("md5").update(readFileSync(`${OUT}/${f}.png`)).digest("hex"); (hashes[h] ||= []).push(f); }
const dupes = Object.values(hashes).filter((v) => v.length > 1);
console.log("identical shots:", dupes.length ? JSON.stringify(dupes) : "none");
writeFileSync("../cmp/capture-log.txt", log.join("\n") + "\nidentical: " + JSON.stringify(dupes));
