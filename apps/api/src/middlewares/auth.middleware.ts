import type { Request, RequestHandler } from "express";
import { getClerkUserId } from "@/auth/clerk";
import { UsersService, type AuthUser } from "@/services/users.service";
import { AppError } from "@/utils/AppError";
import { asyncHandler } from "@/utils/asyncHandler";

/** Signs the request in: finds (or creates) our user for the Clerk session and puts it on `req.user`. */
export const requireUser = asyncHandler(async (req, _res, next) => {
    const clerkId = getClerkUserId(req);
    if (!clerkId) throw notSignedIn();

    req.user = await UsersService.findOrCreate(clerkId);
    next();
});

/** Mount after `requireUser`. */
export const requireAdmin: RequestHandler = (req, _res, next) => {
    if (currentUser(req).role !== "admin") throw new AppError("Only an admin can do this.", 403, "FORBIDDEN");
    next();
};

/** The signed-in user, for controllers behind `requireUser`. */
export function currentUser(req: Request): AuthUser {
    if (!req.user) throw notSignedIn();
    return req.user;
}

function notSignedIn() {
    return new AppError("Sign in to continue.", 401, "UNAUTHENTICATED");
}
