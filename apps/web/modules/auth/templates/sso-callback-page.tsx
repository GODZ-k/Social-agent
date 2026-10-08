import { SsoCallback } from "@/lib/auth/client";

/** Where Google returns to. Clerk finishes the session in the browser, then sends them on. */
export function SsoCallbackPage() {
  return <SsoCallback />;
}
