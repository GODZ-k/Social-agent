// Opens a visible browser at /sign-in; the owner signs in by hand. Saves the session once they reach the app.
import { chromium } from "playwright";
const b = await chromium.launch({ headless: false });
const c = await b.newContext({ viewport: { width: 1280, height: 860 } });
const p = await c.newPage();
await p.goto("http://localhost:3000/sign-in", { timeout: 120000 });
const inAuth = (u) => /\/(sign-in|sign-up|sso-callback|verify|two-factor)/.test(new URL(u).pathname) || /accounts\.google\.com|clerk\.accounts\.dev/.test(u);
for (let i = 0; i < 600; i++) {
  await p.waitForTimeout(2000);
  let url; try { url = p.url(); } catch { break; }
  if (!inAuth(url) && url.startsWith("http://localhost:3000")) {
    await p.waitForTimeout(3000);
    await c.storageState({ path: "owner-state.json" });
    console.log("SIGNED_IN at", new URL(p.url()).pathname);
    break;
  }
}
await b.close();
