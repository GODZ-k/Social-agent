import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Everything is private except the pages you need in order to get in.
// A Google sign-in, a code check or a second step lands on these before the session exists.
// Setting up two-factor stays private; managing it lives in the account dialog.
const isPublicRoute = createRouteMatcher([
  "/sign-in(/.*)?",
  "/sign-up(/.*)?",
  "/sso-callback(/.*)?",
  "/verify(/.*)?",
  "/forgot-password(/.*)?",
  "/reset-password(/.*)?",
  "/invite(/.*)?",
  "/two-factor",
  "/two-factor/lost-access",
]);

/**
 * The pages that only exist to get someone in. Once they are in, these have
 * nothing to offer: they are authentication, not account settings, and every one
 * of them either restarts a sign-in the person has already finished or hands
 * their account back to them on worse terms. Changing a password and managing
 * two-factor belong to the account, and live in its dialog — not on a route.
 *
 * `/sso-callback` and `/invite` are left out on purpose: the first runs while a
 * session is being created, and the second is how someone already signed in
 * joins a brand they were invited to.
 */
const isSignedOutOnlyRoute = createRouteMatcher([
  "/sign-in(/.*)?",
  "/sign-up(/.*)?",
  "/verify(/.*)?",
  "/forgot-password(/.*)?",
  "/reset-password(/.*)?",
  "/two-factor",
  "/two-factor/lost-access",
]);

// Next.js 16 calls this file `proxy.ts` (it was `middleware.ts` before).
export default clerkMiddleware(async (auth, request) => {
  const { userId } = await auth();
  if (userId && isSignedOutOnlyRoute(request)) return NextResponse.redirect(new URL("/", request.url));
  if (!isPublicRoute(request)) await auth.protect();
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files, unless they appear in search params.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes.
    "/(api|trpc)(.*)",
  ],
};
