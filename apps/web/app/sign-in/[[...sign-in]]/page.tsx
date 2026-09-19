import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";
import { AuthFormFallback, AuthShell } from "@/components/auth/auth-shell";

export const metadata: Metadata = { title: "Sign in" };

export default function SignInPage() {
  return (
    <AuthShell title="Welcome back" description="Sign in to review posts, check the calendar and see what the agent has learned.">
      <SignIn fallback={<AuthFormFallback />} />
    </AuthShell>
  );
}
