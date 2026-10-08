"use client";

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";
import { routes } from "@/config/routes";

/** Where Clerk's bot check draws itself on sign-up. Renders nothing visible unless a challenge is needed. */
export function BotCheck() {
  return <div id="clerk-captcha" />;
}

/** Finishes a Google sign-in or sign-up after the provider sends the person back. */
export function SsoCallback() {
  return <AuthenticateWithRedirectCallback secondFactorUrl={routes.auth.twoFactor} signInUrl={routes.auth.signIn} signUpUrl={routes.auth.signUp} />;
}
