// Terminal command for the brand scan:  pnpm --filter api run scan -- <url> [--fetch | --facts]
// --fetch prints the home page as Firecrawl returned it; --facts runs everything but the AI step.
// Both need no database; the full scan needs ANTHROPIC_API_KEY and DATABASE_URL in apps/api/.env.
import "dotenv/config";
import { fetchPage } from "../src/scan/firecrawl";
import { SCAN_BUDGET_MS, discoverSite, readSite } from "../src/scan/index";
import { normaliseScanUrl } from "../src/scan/normalise-url";
import { ScanError } from "../src/scan/types";

const args = process.argv.slice(2).filter((arg) => arg !== "--");
const flags = new Set(args.filter((arg) => arg.startsWith("--")));
const input = args.find((arg) => !arg.startsWith("--"));

const print = (value: unknown) => console.log(JSON.stringify(value, null, 2));

async function fetchOnly(url: string): Promise<number> {
  const page = await fetchPage(url, { deadline: Date.now() + SCAN_BUDGET_MS, withBranding: true });
  print({ ok: true, url: page.url, htmlChars: page.html.length, links: page.links.length, branding: page.branding });
  return 0;
}

async function factsOnly(url: string): Promise<number> {
  const deadline = Date.now() + SCAN_BUDGET_MS;
  const discovery = await discoverSite(url, deadline);
  console.error(`picked pages:\n${discovery.pageUrls.map((page) => `  ${page}`).join("\n") || "  (none)"}`);
  const { facts, warnings } = await readSite(discovery, deadline);
  // Page text is long: show its start, not all of it.
  const pages = facts.pages.map(({ text, ...page }) => ({ ...page, text: `${text.slice(0, 160)}...` }));
  print({ ok: true, facts: { ...facts, pages }, warnings });
  return 0;
}

async function fullScan(rawInput: string): Promise<number> {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("ANTHROPIC_API_KEY is missing in apps/api/.env. Use --facts to run without the AI step.");
    return 2;
  }
  // Imported here so --fetch and --facts never load Mastra or open a database connection.
  const { runBrandScan } = await import("../src/mastra/workflows/brand-scan/run");
  const started = Date.now();
  const outcome = await runBrandScan(rawInput, {
    onStep: (step) => console.error(`[${((Date.now() - started) / 1000).toFixed(1)}s] ${step}`),
  });
  print(outcome);
  console.error(`done in ${((Date.now() - started) / 1000).toFixed(1)}s`);
  return outcome.ok ? 0 : 1;
}

async function main(): Promise<number> {
  if (!input) {
    console.error("Usage: pnpm --filter api run scan -- <url> [--fetch | --facts]");
    return 2;
  }
  if (flags.has("--fetch")) return fetchOnly(normaliseScanUrl(input));
  if (flags.has("--facts")) return factsOnly(normaliseScanUrl(input));
  return fullScan(input);
}

main()
  .catch((error) => {
    if (error instanceof ScanError) {
      print({ ok: false, code: error.code, message: error.message });
      return 1;
    }
    console.error(error);
    return 1;
  })
  // Explicit exit: Mastra's Postgres pool would keep the process alive.
  .then((code) => process.exit(code));
