/** SigNoz base URL: an env var so each environment points at its own instance. */
const SIGNOZ_BASE = (process.env.NEXT_PUBLIC_SIGNOZ_URL || "https://signoz.thescaleagency.dev").replace(/\/$/, "");

export const signozTraceUrl = (traceId: string) => `${SIGNOZ_BASE}/trace/${traceId}`;

export const signozLogsUrl = () => `${SIGNOZ_BASE}/logs`;

/** A route's requests in SigNoz, filtered by its path. */
export const signozRequestsUrl = (path: string) => `${SIGNOZ_BASE}/logs?path=${encodeURIComponent(path)}`;
