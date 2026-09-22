import { websiteUrlSchema } from "@social-agent/shared";

const HAS_SCHEME = /^[a-z][a-z0-9+.-]*:\/\//i;

/**
 * What a person typed, as the address the scan will try. Anything URL-shaped is kept so that
 * "localhost" and "10.0.0.1:8080" reach vetAddress and answer BLOCKED_ADDRESS, not INVALID_URL.
 */
export function normaliseScanUrl(input: string): string {
  const trimmed = input.trim();
  const parsed = websiteUrlSchema.safeParse(trimmed);
  if (parsed.success) return parsed.data;
  if (HAS_SCHEME.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}
