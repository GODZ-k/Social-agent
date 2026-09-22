"use client";

import { APP_NAME } from "@/lib/utils";

/**
 * Replaces the root layout when it fails, so it must render its own <html>
 * and cannot rely on providers, fonts or the design system being mounted.
 */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", display: "grid", placeItems: "center", minHeight: "100dvh", margin: 0 }}>
        <main style={{ textAlign: "center", maxWidth: "28rem", padding: "1rem" }}>
          <p style={{ fontWeight: 600 }}>{APP_NAME} didn&apos;t load</p>
          <p style={{ opacity: 0.7 }}>{error.message}</p>
          <button type="button" onClick={reset} style={{ marginTop: "1rem", padding: "0.5rem 1rem" }}>
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
