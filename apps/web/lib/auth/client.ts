// Everything a client component may use for auth. Components import from here,
// never from a provider. To change provider, point this line at another adapter
// folder that exports the same names, and do the same in lib/auth/server.ts.
export * from "@/lib/auth/clerk/client";
export type * from "./types";
