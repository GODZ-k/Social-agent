/** The Brand Analyst's text budget and how much of its voice must be proved by the site. */
export const BRAND_ANALYST_LIMITS = {
  // About 7k tokens of page text at ~4 characters per token. The home page gets the largest share.
  TEXT_BUDGET_CHARS: 28_000,
  HOME_PAGE_CHARS: 8_000,
  // Voice words whose quote is found on the site; fewer on the first answer earns one retry.
  MIN_VOICE_WORDS: 2,
} as const;
