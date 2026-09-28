import "server-only";

// Everything server code may use for auth. To change provider, point these lines
// at another adapter folder that exports the same names.
export { getSessionUser, endSession, inviteTokenFrom } from "./clerk/server";
export { authCapabilities } from "./clerk/capabilities";
export type * from "./types";
