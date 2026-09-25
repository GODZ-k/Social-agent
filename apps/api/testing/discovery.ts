// TESTING TOOL: business discovery (Growth Consultant + Audience Researcher) on a real brand.
//
// What it does: loads the brand from the database (brand kit, approved intake, latest scan and
// research), runs the whole business-discovery workflow and prints the outcome. Nothing is saved:
// only the API's research queue stores versions.
//
// How to use (from the repo root):
//   pnpm --filter api run discovery -- <brandId>
//   e.g. pnpm --filter api run discovery -- cda30f29-...   (a brand whose intake is approved)
//
// Needs in apps/api/.env: DATABASE_URL, ANTHROPIC_API_KEY, FIRECRAWL_API_KEY. Costs real money
// (Opus calls plus up to 8 searches and 12 page reads) and takes about 3 to 5 minutes.
//
// What you should see: progress lines "[12.0s] diagnose" on stderr, then JSON
//   { ok: true, brief: { ...growth brief }, profile: { ...audience profile }, sources: [urls read] }
//   or { ok: false, code: "INTAKE_REQUIRED", message } when the brand has no approved intake.
// Exit code 0 = ok, 1 = failed, 2 = usage or missing key.
import "dotenv/config";
import { isUuid } from "@/utils";

const args = process.argv.slice(2).filter((arg) => arg !== "--");
const brandId = args.find((arg) => !arg.startsWith("--"));

const print = (value: unknown) => console.log(JSON.stringify(value, null, 2));

async function main(): Promise<number> {
  if (!brandId || !isUuid(brandId)) {
    console.error("Usage: pnpm --filter api run discovery -- <brandId>");
    return 2;
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("ANTHROPIC_API_KEY is missing in apps/api/.env.");
    return 2;
  }

  // Imported here so a usage error never loads Mastra or opens a database connection.
  const { runBusinessDiscovery } = await import("@/mastra/workflows/business-discovery/run");
  const started = Date.now();
  const outcome = await runBusinessDiscovery(brandId, {
    onStep: (step) => console.error(`[${((Date.now() - started) / 1000).toFixed(1)}s] ${step}`),
  });
  print(outcome);
  console.error(`done in ${((Date.now() - started) / 1000).toFixed(1)}s`);
  return outcome.ok ? 0 : 1;
}

main()
  .catch((error) => {
    console.error(error);
    return 1;
  })
  // Explicit exit: the Postgres pools would keep the process alive.
  .then((code) => process.exit(code));
