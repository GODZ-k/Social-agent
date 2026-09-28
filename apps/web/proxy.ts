import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Everything is private except the pages you need in order to get in.
// A Google sign-in, a code check or a second step lands on these before the session exists.
// Setting up and managing two-factor stay private.
const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/sso-callback(.*)",
  "/verify(.*)",
  "/forgot-password(.*)",
  "/reset-password(.*)",
  "/invite(.*)",
  "/two-factor",
  "/two-factor/lost-access",
]);

// Next.js 16 calls this file `proxy.ts` (it was `middleware.ts` before).
export default clerkMiddleware(async (auth, request) => {
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
