import type { AuthUser } from "@/services/users.service";

declare global {
    namespace Express {
        interface Request {
            /** Set by `requireUser`. Read it with `currentUser(req)`. */
            user?: AuthUser;
        }
    }
}

export {};
