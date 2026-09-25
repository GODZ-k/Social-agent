// The per-run allowance the business-discovery workflow hands to its research tools. It is created
// once per run, set on the RequestContext under "budget", and read by every tool call; the tools
// count down, and the workflow reads `sources` at the end to say which pages were used.
import type { RequestContext } from "@mastra/core/request-context";
import { config } from "@/config/constants";

export type ResearchBudget = {
  searchesLeft: number;
  readsLeft: number;
  /** Epoch ms. Every Firecrawl call is bounded by it. */
  deadline: number;
  /** Final addresses of the pages a tool actually read. */
  sources: Set<string>;
};

export type ResearchContext = { budget: ResearchBudget };

export function newResearchBudget(): ResearchBudget {
  return {
    searchesLeft: config.research.SEARCHES_PER_RUN,
    readsLeft: config.research.READS_PER_RUN,
    deadline: Date.now() + config.research.RUN_BUDGET_MS,
    sources: new Set(),
  };
}

/** What a tool tells the model when there is nothing to spend. Plain words; the model reads them. */
export const BUDGET_NOTES = {
  missing: "No research budget in this request.",
  searchesSpent: "Search budget spent. Conclude from what you have.",
  readsSpent: "Read budget spent. Conclude from what you have.",
  timeUp: "Research time is up. Conclude from what you have.",
} as const;

function isResearchBudget(value: unknown): value is ResearchBudget {
  if (typeof value !== "object" || value === null) return false;
  const budget = value as Partial<ResearchBudget>;
  return (
    typeof budget.searchesLeft === "number" &&
    typeof budget.readsLeft === "number" &&
    typeof budget.deadline === "number" &&
    budget.sources instanceof Set
  );
}

/**
 * The run's budget, or undefined when the request carries none (a stray Studio call). Tools get an
 * untyped context from Mastra, so the value is checked rather than trusted.
 */
export function budgetFrom(requestContext: RequestContext<unknown>): ResearchBudget | undefined {
  const value = requestContext.get("budget");
  return isResearchBudget(value) ? value : undefined;
}

export function timeIsUp(budget: ResearchBudget): boolean {
  return Date.now() >= budget.deadline;
}
