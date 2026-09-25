// TESTING TOOL: the two research tools (webSearch, readPage) with no model and no database.
//
// What it does: calls a tool directly, exactly as an agent would, on a fresh research budget.
// Use it to check Firecrawl search and page reading, the address-safety check, and the budget.
//
// How to use (from the repo root):
//   pnpm --filter api run research-tools -- search "best coffee san francisco"
//   pnpm --filter api run research-tools -- search "coffee" --repeat 10   watch the budget run out (8 per run)
//   pnpm --filter api run research-tools -- read https://www.sightglasscoffee.com/
//
// Needs in apps/api/.env: FIRECRAWL_API_KEY.
//
// What you should see:
//   search           -> { results: [{ url, title, description }, ...up to 5] }
//   search --repeat  -> one line per call "#9 0.0s results=0 searchesLeft=0 note=..." once the budget is spent
//   read             -> { url, title, text: first 400 chars..., textChars } and "done in 2.1s; readsLeft=11"
//   a blocked address (localhost, private IP) answers with a "note" instead of text.
// Exit code 0 = ok, 1 = crashed, 2 = usage.
import "dotenv/config";
import { RequestContext } from "@mastra/core/request-context";
import { isValidationError, noopObserve, type ValidationError } from "@mastra/core/tools";
import { readPage } from "@/mastra/tools/read-page";
import { newResearchBudget, type ResearchBudget } from "@/mastra/tools/research-budget";
import { webSearch } from "@/mastra/tools/web-search";

const USAGE = 'Usage: pnpm --filter api run research-tools -- search "<query>" [--repeat N] | read <url>';
const TEXT_PREVIEW_CHARS = 400;

const args = process.argv.slice(2).filter((arg) => arg !== "--");
const command = args[0];
const target = args.find((arg, index) => index > 0 && !arg.startsWith("--"));
const repeatFlag = args.indexOf("--repeat");
const repeat = repeatFlag === -1 ? 1 : Number(args[repeatFlag + 1] ?? "1");

const print = (value: unknown) => console.log(JSON.stringify(value, null, 2));

const seconds = (since: number) => `${((Date.now() - since) / 1000).toFixed(1)}s`;

/** A tool answers its output, a validation error, or nothing; only the output is worth printing. */
function settled<T>(output: T | ValidationError | void): Exclude<T, ValidationError> {
  if (output === undefined || isValidationError(output)) throw new Error(`tool answered ${JSON.stringify(output)}`);
  return output as Exclude<T, ValidationError>;
}

type ToolContext = { requestContext: RequestContext; observe: typeof noopObserve };

/** The context a tool sees is untyped, so the budget goes in with setRaw; the workflow uses the typed set. */
function freshRun(): { context: ToolContext; budget: ResearchBudget } {
  const budget = newResearchBudget();
  const requestContext = new RequestContext();
  requestContext.setRaw("budget", budget);
  return { context: { requestContext, observe: noopObserve }, budget };
}

async function search(query: string): Promise<number> {
  const { context, budget } = freshRun();
  for (let call = 1; call <= repeat; call += 1) {
    const started = Date.now();
    const result = await webSearch.execute!({ query }, context);
    const output = settled(result);
    if (repeat === 1) {
      print(output);
      continue;
    }
    const note = output.note ? ` note="${output.note}"` : "";
    console.log(`#${call} ${seconds(started)} results=${output.results.length} searchesLeft=${budget.searchesLeft}${note}`);
  }
  return 0;
}

async function read(url: string): Promise<number> {
  const { context, budget } = freshRun();
  const started = Date.now();
  const result = await readPage.execute!({ url }, context);
  const output = settled(result);
  const preview = output.text.length > TEXT_PREVIEW_CHARS ? `${output.text.slice(0, TEXT_PREVIEW_CHARS)}...` : output.text;
  print({ ...output, text: preview, textChars: output.text.length });
  console.error(`done in ${seconds(started)}; readsLeft=${budget.readsLeft}; sources=${JSON.stringify([...budget.sources])}`);
  return 0;
}

async function main(): Promise<number> {
  if (command === "search" && target) return search(target);
  if (command === "read" && target) return read(target);
  console.error(USAGE);
  return 2;
}

main()
  .catch((error) => {
    console.error(error);
    return 1;
  })
  .then((code) => process.exit(code));
