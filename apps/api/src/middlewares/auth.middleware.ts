import type { Request } from "express";
import { getClerkUserId } from "@/auth/clerk";
import { UsersService, type AuthUser } from "@/services/users.service";
import { AppError } from "@/utils/AppError";
import { asyncHandler } from "@/utils/asyncHandler";

const unauthenticated = () => new AppError("Sign in to continue.", 401, "UNAUTHENTICATED");

export const requireUser = asyncHandler(async (req, _res, next) => {
    const clerkId = getClerkUserId(req);
    if (!clerkId) throw unauthenticated();

    req.user = await UsersService.findOrCreate(clerkId);
    next();
});

export function currentUser(req: Request): AuthUser {
    if (!req.user) throw unauthenticated();
    return req.user;
}
