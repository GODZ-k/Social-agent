"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import type { ActionResult } from "./result";

interface Options<T> {
  /** Runs with the data when the action succeeds. */
  onSuccess?: (data: T) => void;
  /** Shown as a toast on success. A function gets the data. */
  success?: string | ((data: T) => string);
  /** Prefixed to the action's message in the error toast. */
  failure?: string;
}

/**
 * Calls a Server Action inside a transition and reports the outcome.
 *
 * The pending flag covers both the action and the re-render of the
 * revalidated route, so buttons stay disabled until the screen shows the
 * change. Failures always surface as a toast; success is opt-in.
 */
export function useServerAction<A extends unknown[], T>(
  action: (...args: A) => Promise<ActionResult<T>>,
  { onSuccess, success, failure }: Options<T> = {},
) {
  const [isPending, startTransition] = useTransition();

  function run(...args: A) {
    startTransition(async () => {
      const result = await action(...args);
      if (!result.ok) {
        toast.error(failure ? `${failure} ${result.message}` : result.message);
        return;
      }
      if (success) toast.success(typeof success === "function" ? success(result.data) : success);
      onSuccess?.(result.data);
    });
  }

  return { run, isPending };
}
