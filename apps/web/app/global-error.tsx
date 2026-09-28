"use client";

import { useState } from "react";
import { APP_NAME } from "@/lib/utils";

const SUPPORT_EMAIL = "support@thescaleagency.org";

// Inline styles only, own <html>: the root layout itself failed, so no font, provider or
// design-system token can be trusted to have mounted. Mirrors design/web-v2/system_states.py
// error_global() line for line, raw hex included — this is the one file that mock means literally.
const CSS = `
  body { margin: 0; min-height: 100dvh; display: grid; place-items: center; background: #f2f5fa; color: #1c2433; font-family: system-ui, -apple-system, "Segoe UI", sans-serif; -webkit-font-smoothing: antialiased; }
  main { width: min(28rem, calc(100vw - 2rem)); padding: 2.5rem 2rem; box-sizing: border-box; border-radius: 1.5rem; background: #fff; box-shadow: 0 1px 2px rgba(28,36,51,.06), 0 8px 24px rgba(28,36,51,.06); text-align: center; }
  .logo { display: inline-flex; align-items: center; gap: .5rem; font-weight: 600; font-size: 1.0625rem; }
  h1 { margin: 1.75rem 0 0; font-size: 1.5rem; line-height: 1.2; letter-spacing: -.02em; }
  p { margin: .75rem 0 0; color: #5b6576; line-height: 1.5; }
  .actions { display: flex; gap: .625rem; justify-content: center; flex-wrap: wrap; margin-top: 1.75rem; }
  button { font: inherit; height: 2.75rem; padding: 0 1.25rem; border-radius: 999px; border: 1px solid #dde3ec; background: #fff; color: inherit; font-weight: 500; cursor: pointer; }
  button.primary { background: #4b3fe4; border-color: #4b3fe4; color: #fff; }
  button:focus-visible { outline: 2px solid #4b3fe4; outline-offset: 2px; }
  .ref { margin-top: 1.75rem; font-size: .8125rem; }
  .ref b { color: #1c2433; font-variant-numeric: tabular-nums; }
  @media (max-width: 480px) { .actions { flex-direction: column-reverse; } button { width: 100%; } main { padding: 2rem 1.25rem; } }
`;

/**
 * Replaces the root layout when it fails, so it must render its own <html>
 * and cannot rely on providers, fonts or the design system being mounted.
 * Never shows the raw error message (design rule ST-1) — a generic line and
 * a support reference instead.
 */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  // Lazy initializer: generated once on mount, stable across re-renders (e.g. clicking "Try again").
  const [fallbackReference] = useState(() => Math.floor(1_000_000_000 + Math.random() * 9_000_000_000).toString());
  const reference = error.digest ?? fallbackReference;
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{APP_NAME} didn&apos;t load</title>
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
      </head>
      <body>
        <main role="alert">
          <span className="logo">
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              <rect x="3" y="9" width="4.5" height="10" rx="2.25" fill="#4b3fe4" opacity=".55" />
              <rect x="9.75" y="4" width="4.5" height="15" rx="2.25" fill="#4b3fe4" />
              <rect x="16.5" y="7" width="4.5" height="12" rx="2.25" fill="#4b3fe4" opacity=".8" />
            </svg>
            {APP_NAME}
          </span>
          <h1>{APP_NAME} didn&apos;t load</h1>
          <p>Something went wrong while opening the app. Reload to try again; your brands and posts are safe.</p>
          <div className="actions">
            <button type="button" onClick={() => window.history.back()}>
              Go back
            </button>
            <button type="button" className="primary" onClick={reset}>
              Try again
            </button>
          </div>
          <p className="ref">
            Reference <b>{reference}</b>. If it keeps happening, send it to {SUPPORT_EMAIL}.
          </p>
        </main>
      </body>
    </html>
  );
}
