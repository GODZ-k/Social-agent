import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";
import { AuthFormFallback, AuthShell } from "@/components/auth/auth-shell";


// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata: Metadata = { title: "Sign in" };

export default function SignInPage() {
  return (
    <AuthShell title="Welcome back" description="Sign in to review posts, check the calendar and see what the agent has learned.">
      <SignIn fallback={<AuthFormFallback />} />
    </AuthShell>
  );
}
