import "server-only";

// Everything server code may use for auth. To change provider, point these lines
// at another adapter folder that exports the same names.
export { getSessionUser, endSession, inviteTokenFrom } from "@/lib/auth/clerk/server";
export { authCapabilities } from "@/lib/auth/clerk/capabilities";
export type * from "./types";
