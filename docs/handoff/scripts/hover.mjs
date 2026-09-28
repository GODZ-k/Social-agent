// Screenshot an element while the pointer hovers a target. Usage: node hover.mjs <html> <hoverSel> <shotSel> <png> <width>
import { chromium } from "playwright";
import { pathToFileURL } from "node:url";
const [, , file, hoverSel, shotSel, out, width] = process.argv;
const b = await chromium.launch(); const c = await b.newContext({ viewport: { width: Number(width), height: 900 }, deviceScaleFactor: 2 });
const p = await c.newPage(); await p.goto(pathToFileURL(file).href); await p.waitForTimeout(1200);
await p.locator(hoverSel).first().hover(); await p.waitForTimeout(300);
await p.locator(shotSel).first().screenshot({ path: out }); await b.close();
