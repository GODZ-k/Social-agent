import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { publicRoutePatterns, routes, signedOutOnlyRoutePatterns } from "@/config/routes";

const isPublicRoute = createRouteMatcher(publicRoutePatterns);

const isSignedOutOnlyRoute = createRouteMatcher(signedOutOnlyRoutePatterns);

export default clerkMiddleware(async (auth, request) => {
  const { userId } = await auth();
  if (userId && isSignedOutOnlyRoute(request)) return NextResponse.redirect(new URL(routes.home, request.url));
  if (!isPublicRoute(request)) await auth.protect();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
