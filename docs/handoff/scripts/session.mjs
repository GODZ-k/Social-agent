import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { chromium } from "playwright";

const envPath = "C:/Users/Rnf-user.DESKTOP-H20A3J8/Desktop/social_agent/apps/web/.env.local";
const envText = fs.readFileSync(envPath, "utf8");
const secretMatch = envText.match(/^CLERK_SECRET_KEY=(.+)$/m);
if (!secretMatch) throw new Error("CLERK_SECRET_KEY not found");
const CLERK_SECRET_KEY = secretMatch[1].trim();

const EMAIL = `wave1b+clerk_test@example.com`;
const PASSWORD = "Wave1b-Passw0rd-2026!";

function base32Decode(base32) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = "";
  for (const char of base32.replace(/=+$/, "").toUpperCase()) {
    const idx = alphabet.indexOf(char);
    if (idx === -1) continue;
    bits += idx.toString(2).padStart(5, "0");
  }
  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.slice(i, i + 8), 2));
  }
  return Buffer.from(bytes);
}

function totp(secretBase32, timeStep = 30, digits = 6) {
  const key = base32Decode(secretBase32);
  const counter = Math.floor(Date.now() / 1000 / timeStep);
  const counterBuf = Buffer.alloc(8);
  counterBuf.writeBigUInt64BE(BigInt(counter));
  const hmac = crypto.createHmac("sha1", key).update(counterBuf).digest();
  const offset = hmac[hmac.length - 1] & 0xf;
  const code =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);
  return (code % 10 ** digits).toString().padStart(digits, "0");
}

async function clerkApi(method, urlPath, body) {
  const res = await fetch(`https://api.clerk.com/v1${urlPath}`, {
    method,
    headers: {
      Authorization: `Bearer ${CLERK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = text;
  }
  if (!res.ok) throw new Error(`Clerk ${method} ${urlPath} failed: ${res.status} ${text}`);
  return json;
}

let userId;
try {
  const user = await clerkApi("POST", "/users", {
    email_address: [EMAIL],
    password: PASSWORD,
    public_metadata: { role: "admin" },
    skip_password_checks: true,
  });
  userId = user.id;
  console.log("created user id:", userId);

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto("http://localhost:3000/sign-in", { waitUntil: "networkidle" });
  await page.waitForSelector('input[name="identifier"], input[type="email"]', { timeout: 30000 });
  const emailInput = page.locator('input[name="identifier"], input[type="email"]').first();
  await emailInput.fill(EMAIL);
  await page.keyboard.press("Enter");
  await page.waitForTimeout(1500);

  const passwordInput = page.locator('input[name="password"], input[type="password"]').first();
  if (await passwordInput.isVisible({ timeout: 5000 }).catch(() => false)) {
    await passwordInput.fill(PASSWORD);
    await page.keyboard.press("Enter");
    await page.waitForTimeout(2000);
  }

  // handle verify code step if present
  if (page.url().includes("/verify")) {
    const codeInput = page.locator('input[name="code"], input[data-otp-input], input[type="text"]').first();
    await codeInput.fill("424242").catch(() => {});
    await page.keyboard.press("Enter");
    await page.waitForTimeout(2000);
  }

  await page.waitForTimeout(1500);
  console.log("post sign-in url:", page.url());

  if (page.url().includes("/two-factor/setup")) {
    await page.waitForTimeout(1000);
    const bodyText = await page.textContent("body");
    const keyMatch = bodyText.match(/[A-Z2-7]{16,}/);
    if (!keyMatch) throw new Error("could not find TOTP setup key on page");
    const setupKey = keyMatch[0];
    const code = totp(setupKey);
    const otpInputs = page.locator('input[type="text"], input[inputmode="numeric"], input[name="code"]');
    const count = await otpInputs.count();
    if (count > 1) {
      for (let i = 0; i < code.length && i < count; i++) {
        await otpInputs.nth(i).fill(code[i]);
      }
    } else if (count === 1) {
      await otpInputs.first().fill(code);
    }
    await page.keyboard.press("Enter");
    await page.waitForTimeout(2000);
    // continue past backup codes screen if shown
    const continueBtn = page.getByRole("button", { name: /continue|done|finish/i }).first();
    if (await continueBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await continueBtn.click();
      await page.waitForTimeout(1500);
    }
  }

  await page.waitForTimeout(1500);
  console.log("final url:", page.url());

  const statePath = "C:/Users/Rnf-user.DESKTOP-H20A3J8/AppData/Local/Temp/claude/C--Users-Rnf-user-DESKTOP-H20A3J8-Desktop-social-agent/0961f288-92d5-46ce-a429-ea293764a829/scratchpad/pw/admin-state.json";
  await context.storageState({ path: statePath });
  console.log("saved storage state to", statePath);

  await browser.close();
} finally {
  if (userId) {
    await clerkApi("DELETE", `/users/${userId}`).catch((e) => console.error("cleanup failed:", e.message));
    console.log("deleted user id:", userId);
  }
}
