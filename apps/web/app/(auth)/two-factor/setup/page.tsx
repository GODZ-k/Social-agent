import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@repo/ui/components/button";
import { safeRedirect } from "@/lib/auth/redirect";
import { getViewerRole } from "@/lib/auth/viewer";
import { AuthFrame } from "@/components/auth/auth-frame";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { TwoFactorPanel } from "@/components/auth/two-factor-panel";
import { TwoFactorSetup } from "@/components/auth/two-factor-setup";

export const metadata: Metadata = { title: "Turn on two-factor" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function TwoFactorSetupPage({ searchParams }: { searchParams: SearchParams }) {
  const [role, params] = await Promise.all([getViewerRole(), searchParams]);
  if (!role) redirect("/sign-in");
  const redirectTo = safeRedirect(params.redirect_url);
  const isAdmin = role === "admin";
  const panel = isAdmin ? (
    <TwoFactorPanel heading="Admin accounts open every client's brand." body="So they need a second step at sign-in. A stolen password alone can't get in." />
  ) : (
    <TwoFactorPanel heading="Keep your brand safe." body="A second step at sign-in means a stolen password alone can't get in." />
  );
  const lede = isAdmin
    ? "Admin accounts need a second step after the password. Set it up once, now. It takes about a minute."
    : "Add a second step after your password. It takes about a minute.";
  const skip = isAdmin ? null : (
    <Button asChild variant="ghost" size="lg" className="w-full">
      <Link href={redirectTo}>Not now</Link>
    </Button>
  );
  const promise = isAdmin ? "Admin accounts always sign in with two steps." : "Two-factor keeps your account safe.";
  return (
    <AuthFrame top={<SignOutButton />} panel={panel} promise={promise}>
      <TwoFactorSetup lede={lede} redirectTo={redirectTo} skip={skip} />
    </AuthFrame>
  );
}
