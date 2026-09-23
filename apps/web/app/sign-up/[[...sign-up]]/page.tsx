import type { Metadata } from "next";
import { SignUp } from "@clerk/nextjs";
import { AuthFormFallback, AuthShell } from "@/components/auth/auth-shell";


// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata: Metadata = { title: "Create your account" };

export default function SignUpPage() {
  return (
    <AuthShell title="Start with your website" description="Create an account, paste your URL, and the agent drafts your brand kit, strategy and first posts.">
      <SignUp fallback={<AuthFormFallback />} />
    </AuthShell>
  );
}
