"use server";

import { redirect } from "next/navigation";
import { endSession } from "./server";
import type { AuthResult } from "./types";

/** Signs out on the server and goes to sign in. Usable as `<form action={signOut}>`. */
export async function signOut(): Promise<void> {
  await endSession();
  redirect("/sign-in");
}

/**
 * Lost two-factor access goes to Cadence support, never to email alone.
 * There is no support endpoint yet, so this says so instead of pretending it was sent.
 */
export async function requestAccountRecovery(): Promise<AuthResult> {
  return { ok: false, error: { code: "not_supported" } };
}
