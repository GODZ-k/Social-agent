// One-look review: builds a sheet with each screen at desktop, tablet and phone width, and opens it in a visible browser.
// Usage: node look.mjs "<title>" <screen.html> [more.html ...]
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const [, , title, ...files] = process.argv;
const sizes = [
  { label: "Desktop 1440", width: 1440, height: 900, scale: 0.5 },
  { label: "Tablet 768", width: 768, height: 1024, scale: 0.5 },
  { label: "Phone 390", width: 390, height: 844, scale: 0.6 },
];
const frame = (url, s) => `<figure><figcaption>${s.label}</figcaption><div class="box" style="width:${s.width * s.scale}px;height:${s.height * s.scale}px"><iframe src="${url}" style="width:${s.width}px;height:${s.height}px;transform:scale(${s.scale})"></iframe></div></figure>`;
const rows = files.map((file) => {
  const url = pathToFileURL(file).href;
  return `<section><h2>${basename(file, ".html")} <a href="${url}" target="_blank">open full</a></h2><div class="row">${sizes.map((s) => frame(url, s)).join("")}</div></section>`;
}).join("");
const sheet = `<!doctype html><meta charset="utf-8"><title>${title}</title><style>
body{margin:0;padding:24px;background:#e9ebf0;font:14px system-ui,sans-serif;color:#1c2030}
h1{font-size:20px;margin:0 0 20px}h2{font-size:15px;margin:28px 0 10px}h2 a{font-size:12px;margin-left:8px;color:#4B3FE4}
.row{display:flex;gap:20px;align-items:flex-start;flex-wrap:wrap}figure{margin:0}figcaption{font-size:12px;color:#5b6272;margin-bottom:6px}
.box{overflow:hidden;border-radius:10px;background:#fff;box-shadow:0 2px 12px rgba(0,0,0,.12)}iframe{border:0;transform-origin:0 0}
</style><h1>${title}</h1>${rows}`;
const sheetPath = join(dirname(fileURLToPath(import.meta.url)), "review.html");
writeFileSync(sheetPath, sheet);

const browser = await chromium.launch({ headless: false, args: ["--start-maximized"] });
const context = await browser.newContext({ viewport: null });
const page = await context.newPage();
await page.goto(pathToFileURL(sheetPath).href);
console.log(`opened ${sheetPath}`);
await new Promise((resolve) => browser.on("disconnected", resolve));
