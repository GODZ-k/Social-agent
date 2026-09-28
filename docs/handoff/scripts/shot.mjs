// Full-page screenshot at an exact width via Chrome device emulation. Usage: node shot.mjs <html> <png> <width> [mobile]
import { spawn } from "node:child_process";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
const [, , file, out, width, mobile] = process.argv;
const chrome = spawn("C:/Program Files/Google/Chrome/Application/chrome.exe", ["--headless=new", "--disable-gpu", "--hide-scrollbars", "--remote-debugging-port=9444", `--user-data-dir=${mkdtempSync(join(tmpdir(), "shot-"))}`, "about:blank"], { stdio: "ignore" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let targets;
for (let i = 0; i < 40 && !targets; i++) { await sleep(250); targets = await fetch("http://127.0.0.1:9444/json").then((r) => r.json()).catch(() => null); }
const ws = new WebSocket(targets.find((t) => t.type === "page").webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener("open", r));
let id = 0; const pending = new Map();
ws.addEventListener("message", (e) => { const m = JSON.parse(e.data); pending.get(m.id)?.(m.result); pending.delete(m.id); });
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const isMobile = mobile === "mobile";
await send("Emulation.setDeviceMetricsOverride", { width: Number(width), height: 900, deviceScaleFactor: isMobile ? 2 : 1, mobile: isMobile });
await send("Page.navigate", { url: "file:///" + file.split(String.fromCharCode(92)).join("/") });
await sleep(4000);
const { result } = await send("Runtime.evaluate", { expression: `JSON.stringify({h: document.documentElement.scrollHeight, overflow: document.documentElement.scrollWidth > ${Number(width)}})`, returnByValue: true });
const { h, overflow } = JSON.parse(result.value);
// Make the viewport as tall as the page so bars fixed to the bottom land at the real bottom.
await send("Emulation.setDeviceMetricsOverride", { width: Number(width), height: Math.min(h, 4000), deviceScaleFactor: isMobile ? 2 : 1, mobile: isMobile });
await sleep(500);
const shot = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: { x: 0, y: 0, width: Number(width), height: Math.min(h, 4000), scale: 1 } });
writeFileSync(out, Buffer.from(shot.data, "base64"));
console.log(`${out.split(/[\/]/).pop()}: ${width}px, height ${h}, sideways scroll: ${overflow}`);
ws.close(); chrome.kill();
