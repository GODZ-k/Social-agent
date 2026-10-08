"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

/**
 * Sets or clears one search param and navigates, keeping every other param as it was.
 *
 * Passing `null` removes the param rather than writing an empty one, so a filter at its default
 * leaves the URL clean — which is what the observability toolbar wants for its default range,
 * its newest release and its "all clients" case.
 */
export function useUrlParam() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return function setParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null) params.delete(key);
    else params.set(key, value);
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };
}
