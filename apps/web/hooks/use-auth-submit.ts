"use client";

import { useState, useTransition } from "react";
import type { AuthError, AuthResult } from "@/lib/auth/types";

/** Runs one auth call inside a transition and keeps its error for the form to show. */
export function useAuthSubmit() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<AuthError | null>(null);

  function run<T>(action: () => Promise<AuthResult<T>>, onSuccess?: (data: T) => void, onError?: (error: AuthError) => void) {
    startTransition(async () => {
      const result = await action();
      startTransition(() => {
        if (!result.ok) {
          setError(result.error);
          onError?.(result.error);
          return;
        }
        setError(null);
        onSuccess?.(result.data);
      });
    });
  }

  return { pending, error, setError, run };
}

/** Runs `onPaused` only for a lockout, so a form's `run(..., onError)` doesn't repeat the check. */
export function whenLocked(onPaused: (error: AuthError) => void) {
  return (error: AuthError) => {
    if (error.code === "too_many_attempts") onPaused(error);
  };
}
