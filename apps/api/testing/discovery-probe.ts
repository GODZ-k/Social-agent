// TESTING TOOL: the two research agents on their own, on a made-up café (no database needed).
//
// What it does: gives the Growth Consultant and/or the Audience Researcher a stub Four Barrel
// Coffee intake (STUB_INPUT below) and shows every step the model takes: which searches and page
// reads it made, how long it took, and the answer. Use it to tune an agent's instructions or
// skills, compare structured-output modes, or measure cost and time.
//
// How to use (from the repo root):
//   pnpm --filter api run discovery-probe -- growth                     Growth Consultant only
//   pnpm --filter api run discovery-probe -- both                       both, sharing one budget like the workflow
//   pnpm --filter api run discovery-probe -- audience --brief brief.json  Audience Researcher on a saved brief
// Options: --mode auto|inline|system|native (how structured output is asked for),
//          --facts <file> (real site facts saved from "scan --facts"), --out <file> (save the JSON).
//
// Needs in apps/api/.env: ANTHROPIC_API_KEY, FIRECRAWL_API_KEY. Costs real money on every run.
//
// What you should see: "[8.4s] step: tool-calls webSearch({...})" lines on stderr, then JSON
//   { report: { mode, growth: { steps, seconds, toolCalls }, audience: {...},
//               budget: { searchesUsed, readsUsed, sources } }, brief, profile }
// Exit code 0 = ok, 1 = crashed, 2 = usage or missing key.
import "dotenv/config";
import { readFileSync, writeFileSync } from "node:fs";
import { RequestContext } from "@mastra/core/request-context";
import { renderDiscoveryInput, renderProfileInput, structuredOutputFor, type JsonPromptInjection } from "@social-agent/agents";
import { audienceProfileSchema, growthBriefSchema, type AudienceProfile, type BrandContext, type GrowthBrief } from "@social-agent/shared";
import type { z } from "zod";
import { config } from "@/config/constants";
import { audienceResearcher, growthConsultant } from "@/mastra/agents/team";
import { newResearchBudget, type ResearchContext } from "@/mastra/tools/research-budget";
import { siteFactsSchema } from "@/scan/types";

const MODES: Record<string, JsonPromptInjection> = { auto: "auto", inline: "inline", system: "system", native: false };

/** A plausible owner's answers for the café, written as the intake screen would save them. */
const STUB_INPUT: BrandContext = {
  brand: {
    name: "Four Barrel Coffee",
    url: "https://www.fourbarrelcoffee.com/",
    industry: "Coffee roaster and cafés",
    brand: {
      tagline: "Independently sourcing, roasting, and brewing the best coffee in San Francisco.",
      summary:
        "Four Barrel roasts coffee it sources directly from growers and serves it in its own San Francisco cafés. It also sells whole-bean coffee and subscriptions online, and supplies wholesale accounts.",
      audience: "Coffee drinkers in San Francisco who care where their beans come from, plus home brewers who order online.",
      voice: ["direct", "unfussy", "confident", "warm"],
      colors: [],
      fonts: { heading: "", body: "" },
      aesthetic: "Bare, industrial, photographs of people and beans over graphics.",
      keywords: ["san francisco coffee roaster", "single origin coffee", "coffee subscription", "valencia street cafe"],
    },
    business: { location: { city: "San Francisco", region: "California", country: "United States" } },
    platforms: ["instagram"],
  },
  intake: {
    offer: "Espresso drinks, pour-overs and pastries in three cafés, whole-bean coffee by the bag in the cafés and online, monthly subscriptions, and wholesale to restaurants and offices.",
    goal: { kind: "repeat_customers", note: "Weekday mornings are full; afternoons and weekends are quiet. We want the regulars back more often and more of them on subscription." },
    bestSellers: "Friendo blend, the seasonal single origins, and the subscription. The subscription is the best margin.",
    capacity: "Afternoons after 2pm and all of Sunday are slow in every café. The roastery can ship twice as many subscriptions as it does today.",
    businessType: "both",
    postLanguage: "en",
    orderValue: { min: 5, max: 20, currency: "USD" },
    notes: [],
    idealCustomer: "Someone who lives or works within ten blocks, comes in most days, and would order beans for home if we asked.",
    competitors: "Ritual Coffee, Sightglass, Blue Bottle",
    constraints: "Never discount the coffee. Never post about the roaster's owner or the past. No latte art clichés.",
  },
  siteFacts: null,
  research: { brief: null, profile: null },
};

const args = process.argv.slice(2).filter((arg) => arg !== "--");
const which = args.find((arg) => !arg.startsWith("--")) ?? "growth";
const option = (name: string): string | undefined => {
  const index = args.indexOf(`--${name}`);
  return index === -1 ? undefined : args[index + 1];
};

const print = (value: unknown) => console.log(JSON.stringify(value, null, 2));
const seconds = (since: number) => ((Date.now() - since) / 1000).toFixed(1);

function loadInput(): BrandContext {
  const factsFile = option("facts");
  if (!factsFile) return STUB_INPUT;
  const saved = JSON.parse(readFileSync(factsFile, "utf8")) as { facts: unknown };
  return { ...STUB_INPUT, siteFacts: siteFactsSchema.parse(saved.facts) };
}

type Probe<T> = { object: T; steps: number; toolCalls: string[]; seconds: string };

/** One structured call, exactly as `generateStructured` makes it, with the tool loop reported step by step. */
async function probe<T>(agent: typeof growthConsultant | typeof audienceResearcher, prompt: string, schema: z.ZodType<T>, requestContext: RequestContext<ResearchContext>, mode: JsonPromptInjection): Promise<Probe<T>> {
  const started = Date.now();
  const toolCalls: string[] = [];
  const response = await agent.generate(prompt, {
    structuredOutput: structuredOutputFor(schema, mode),
    requestContext,
    maxSteps: config.research.MAX_AGENT_STEPS,
    onStepFinish: (step) => {
      const names = step.toolCalls.map((call) => `${call.payload.toolName}(${JSON.stringify(call.payload.args)})`);
      toolCalls.push(...names);
      console.error(`[${seconds(started)}s] step: ${step.finishReason}${names.length ? ` ${names.join(" ")}` : ""}`);
    },
  });
  return { object: schema.parse(response.object), steps: response.steps.length, toolCalls, seconds: seconds(started) };
}

async function main(): Promise<number> {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("ANTHROPIC_API_KEY is missing in apps/api/.env.");
    return 2;
  }
  const mode = MODES[option("mode") ?? "auto"];
  if (mode === undefined) {
    console.error(`Unknown --mode. Use one of: ${Object.keys(MODES).join(", ")}`);
    return 2;
  }

  const input = loadInput();
  const budget = newResearchBudget();
  const requestContext = new RequestContext<ResearchContext>();
  requestContext.set("budget", budget);
  const report: Record<string, unknown> = { mode: option("mode") ?? "auto", siteFacts: input.siteFacts !== null };

  let brief: GrowthBrief | undefined;
  if (which === "growth" || which === "both") {
    const result = await probe(growthConsultant, renderDiscoveryInput(input), growthBriefSchema, requestContext, mode);
    brief = result.object;
    report.growth = { steps: result.steps, seconds: result.seconds, toolCalls: result.toolCalls };
  } else {
    const briefFile = option("brief");
    if (!briefFile) {
      console.error("The audience probe needs --brief <file> with a saved growth brief, or run `both`.");
      return 2;
    }
    brief = growthBriefSchema.parse(JSON.parse(readFileSync(briefFile, "utf8")));
  }

  let profile: AudienceProfile | undefined;
  if (which === "audience" || which === "both") {
    const result = await probe(audienceResearcher, renderProfileInput(input, brief), audienceProfileSchema, requestContext, mode);
    profile = result.object;
    report.audience = { steps: result.steps, seconds: result.seconds, toolCalls: result.toolCalls };
  }

  report.budget = { searchesUsed: config.research.SEARCHES_PER_RUN - budget.searchesLeft, readsUsed: config.research.READS_PER_RUN - budget.readsLeft, sources: [...budget.sources] };
  const output = { report, brief, profile };
  print(output);
  const outFile = option("out");
  if (outFile) writeFileSync(outFile, JSON.stringify(output, null, 2));
  return 0;
}

main()
  .catch((error) => {
    console.error(error);
    return 1;
  })
  // Explicit exit: a Firecrawl request left open would keep the process alive.
  .then((code) => process.exit(code));
