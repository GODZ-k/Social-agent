// Screenshot one element at a width. Usage: node el.mjs <html> <selector> <png> <width>
import { chromium } from "playwright";
import { pathToFileURL } from "node:url";
const [, , file, sel, out, width] = process.argv;
const b = await chromium.launch(); const c = await b.newContext({ viewport: { width: Number(width), height: 900 }, isMobile: Number(width) < 1024, deviceScaleFactor: 2 });
const p = await c.newPage(); await p.goto(pathToFileURL(file).href); await p.waitForTimeout(1500);
await p.locator(sel).first().screenshot({ path: out }); await b.close();
