// Web search for the research agents. Only src/scan/firecrawl.ts talks to Firecrawl; this file
// spends the run's search budget and turns every failure into a note, so nothing throws into the
// model. Results are data: addresses, titles and snippets the agent may choose to read.
import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { config } from "@/config/constants";
import { searchWeb } from "@/scan/firecrawl";
import { BUDGET_NOTES, budgetFrom, timeIsUp } from "./research-budget";

const searchHitSchema = z.object({
  url: z.string(),
  title: z.string(),
  description: z.string(),
});

function withNote(note: string) {
  return { results: [], note };
}

export const webSearch = createTool({
  id: "web-search",
  description:
    "Searches the web and returns up to 5 results (url, title, description). Use it to find competitors, reviews and what customers say. Each call spends one search from a small budget; when the note says the budget is spent, stop searching and conclude.",
  inputSchema: z.object({
    query: z.string().min(1).max(200).describe("Plain search words, as you would type into a search engine."),
  }),
  outputSchema: z.object({
    results: z.array(searchHitSchema),
    note: z.string().optional().describe("Present when nothing was searched, and why."),
  }),
  execute: async ({ query }, { requestContext }) => {
    const budget = budgetFrom(requestContext);
    if (!budget) return withNote(BUDGET_NOTES.missing);
    if (budget.searchesLeft === 0) return withNote(BUDGET_NOTES.searchesSpent);
    if (timeIsUp(budget)) return withNote(BUDGET_NOTES.timeUp);

    budget.searchesLeft -= 1;
    try {
      const results = await searchWeb(query, { limit: config.research.RESULTS_PER_SEARCH, deadline: budget.deadline });
      return { results };
    } catch {
      return withNote(config.research.SEARCH_FAILED_NOTE);
    }
  },
});
