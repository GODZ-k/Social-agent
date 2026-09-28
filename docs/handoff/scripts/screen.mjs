// Screenshot exactly one device screen (for overlays that cover the viewport). Usage: node screen.mjs <html> <png> <width> <height>
import { chromium } from "playwright";
import { pathToFileURL } from "node:url";
const [, , file, out, w, h] = process.argv;
const b = await chromium.launch(); const c = await b.newContext({ viewport: { width: Number(w), height: Number(h) }, isMobile: true, deviceScaleFactor: 2 });
const p = await c.newPage(); await p.goto(pathToFileURL(file).href); await p.waitForTimeout(1500);
const overflow = await p.evaluate((w) => document.documentElement.scrollWidth > w, Number(w));
await p.screenshot({ path: out }); console.log(`${out.split(/[\/]/).pop()}: ${w}x${h}, sideways scroll: ${overflow}`); await b.close();
