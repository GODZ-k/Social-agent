import { websiteUrlSchema } from "@social-agent/shared";

const HAS_SCHEME = /^[a-z][a-z0-9+.-]*:\/\//i;

/**
 * What a person typed, as the address the scan will try. "localhost" and "10.0.0.1:8080" fail the
 * website rule but must answer BLOCKED_ADDRESS, not INVALID_URL, so anything URL-shaped is kept
 * and vetAddress in firecrawl.ts decides.
 */
export function normaliseScanUrl(input: string): string {
  const trimmed = input.trim();
  const parsed = websiteUrlSchema.safeParse(trimmed);
  if (parsed.success) return parsed.data;
  if (HAS_SCHEME.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}
