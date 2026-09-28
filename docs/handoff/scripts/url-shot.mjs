// Screenshot a URL. Usage: node url-shot.mjs <url> <png> <width> <height>
import { chromium } from "playwright";
const [, , url, out, w, h] = process.argv;
const b = await chromium.launch(); const c = await b.newContext({ viewport: { width: Number(w), height: Number(h) }, deviceScaleFactor: 1 });
const p = await c.newPage(); await p.goto(url, { waitUntil: "networkidle", timeout: 90000 }); await p.waitForTimeout(1500);
await p.screenshot({ path: out }); console.log(out, p.url()); await b.close();
