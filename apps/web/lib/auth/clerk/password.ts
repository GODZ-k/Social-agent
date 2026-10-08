"use client";

import { useReverification, useUser } from "@clerk/nextjs";
import { done, fail, failWith } from "./errors";
import type { AuthResult } from "@/lib/auth/types";

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
  /** Ends every other session, which is what you want if the old password leaked. */
  signOutOther: boolean;
}

/**
 * Changing a password while signed in. The reset flow behind /forgot-password is
 * for people who cannot get in; someone already signed in proves themselves with
 * the password they have, and never leaves the app to do it.
 */
export function useChangePassword() {
  const { user, isLoaded } = useUser();
  // Clerk may want the session re-verified first; this raises its prompt rather than failing.
  const update = useReverification((input: ChangePasswordInput) => {
    if (!user) throw new Error("Not signed in");
    return user.updatePassword({
      currentPassword: input.currentPassword,
      newPassword: input.newPassword,
      signOutOfOtherSessions: input.signOutOther,
    });
  });

  async function changePassword(input: ChangePasswordInput): Promise<AuthResult> {
    if (!isLoaded || !user) return failWith("unknown");
    try {
      await update(input);
      return done;
    } catch (error) {
      return fail(error);
    }
  }

  return { ready: isLoaded, changePassword };
}
