import type { Metadata } from "next";
import { SignUp } from "@clerk/nextjs";
import { AuthFormFallback, AuthShell } from "@/components/auth/auth-shell";

export const metadata: Metadata = { title: "Create your account" };

export default function SignUpPage() {
  return (
    <AuthShell title="Start with your website" description="Create an account, paste your URL, and the agent drafts your brand kit, strategy and first posts.">
      <SignUp fallback={<AuthFormFallback />} />
    </AuthShell>
  );
}
