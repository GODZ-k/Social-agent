import { concurrencyLimit } from "@trigger.dev/sdk";

/**
 * One Firecrawl request at a time across every task that calls it.
 *
 * The limit belongs to the resource, not to a task: the free key allows 10 requests a minute, and a
 * single discovery run makes up to 24. A per-task limit would still let a scan and a discovery run
 * together and blow the budget, so both hold this one.
 *
 * Raise `total` when the key is paid for. That is the only change needed — nothing in `src/` knows
 * about the limit.
 */
export const firecrawlLimit = concurrencyLimit({ name: "firecrawl", total: 1 });
