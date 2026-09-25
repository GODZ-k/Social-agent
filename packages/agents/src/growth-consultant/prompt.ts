import type { AudienceProfile, BrandContext, BusinessType, GrowthBrief, Intake, IntakeGoal, Language, MoneyRange, SiteFacts } from "@social-agent/shared";
import { asDataBlock } from "../prompt-text.js";

/** The intake facts that are free text, each with the question it answers, so the model reads a question with its answer. */
type TextFact = "offer" | "bestSellers" | "capacity" | "idealCustomer" | "competitors" | "constraints";

export const INTAKE_QUESTIONS: { key: TextFact; question: string }[] = [
  { key: "offer", question: "What do you sell, and how do people buy it?" },
  { key: "bestSellers", question: "Best sellers, and anything high-margin you would like to sell more of?" },
  { key: "capacity", question: "Spare capacity or slow periods?" },
  { key: "idealCustomer", question: "Who is your ideal customer, in your own words?" },
  { key: "competitors", question: "Two or three competitors or accounts you watch?" },
  { key: "constraints", question: "Anything the posts must never say or show?" },
];

const GOAL_LABELS: Record<IntakeGoal["kind"], string> = {
  more_customers: "More new customers",
  repeat_customers: "More repeat customers",
  bigger_orders: "Bigger orders",
  launch: "Launch something new",
  awareness: "Awareness",
};

const BUSINESS_TYPE_LABELS: Record<BusinessType, string> = {
  product: "Sells products",
  service: "Sells a service",
  both: "Sells products and a service",
};

const LANGUAGE_LABELS: Record<Language, string> = { en: "English", hi: "Hindi", hinglish: "Hinglish" };

export const NOT_ANSWERED = "Not answered";

// About 2k tokens of site text at ~4 characters per token; the brief works mostly from the intake and research.
const SITE_TEXT_BUDGET = 8_000;
const HOME_SHARE = 3_000;

function line(label: string, value?: string | readonly string[]): string {
  if (value === undefined) return "";
  const text = Array.isArray(value) ? value.join(", ") : value;
  return text ? `${label}: ${text}\n` : "";
}

/** One question and its answer per line pair; an unanswered one says so, so the model asks instead of guessing. */
export function renderAnswers(intake: Intake, keys: readonly (typeof INTAKE_QUESTIONS)[number]["key"][]): string {
  return INTAKE_QUESTIONS.filter(({ key }) => keys.includes(key))
    .map(({ key, question }) => `Q: ${question}\nA: ${intake[key] || NOT_ANSWERED}\n`)
    .join("");
}

function renderMoney(range: MoneyRange | undefined): string {
  if (!range) return NOT_ANSWERED;
  if (range.min !== undefined && range.max !== undefined) return `between ${range.min} and ${range.max} ${range.currency}`;
  if (range.max !== undefined) return `under ${range.max} ${range.currency}`;
  return `over ${range.min} ${range.currency}`;
}

function renderNotes(intake: Intake): string {
  return intake.notes.map(({ question, answer }) => `Q: ${question}\nA: ${answer}\n`).join("");
}

function renderIntake(intake: Intake): string {
  const note = intake.goal.note ? ` (${intake.goal.note})` : "";
  const facts =
    `Goal for the next 3 months: ${GOAL_LABELS[intake.goal.kind]}${note}\n` +
    `Business type: ${BUSINESS_TYPE_LABELS[intake.businessType]}\n` +
    `Language of the posts: ${LANGUAGE_LABELS[intake.postLanguage]}\n` +
    `What one customer usually spends: ${renderMoney(intake.orderValue)}\n`;
  const keys = INTAKE_QUESTIONS.map(({ key }) => key);
  return asDataBlock("intake", facts + renderAnswers(intake, keys) + renderNotes(intake));
}

function renderPage(page: SiteFacts["pages"][number], budget: number): string {
  const text = page.text.slice(0, budget);
  return `## Page: ${page.url}\n` + line("Title", page.title) + line("Headings", page.headings.join(" | ")) + (text ? `Text: ${text}\n` : "");
}

/** Names, headings and the start of each page's text, within the budget. The home page gets the largest share. */
function renderSiteFacts(facts: SiteFacts): string {
  const others = Math.max(facts.pages.length - 1, 1);
  const perPage = Math.min(HOME_SHARE, Math.floor((SITE_TEXT_BUDGET - HOME_SHARE) / others));
  const pages = facts.pages.map((page, index) => renderPage(page, index === 0 ? HOME_SHARE : perPage)).join("\n");
  return line("Name candidates on the site", facts.nameCandidates) + line("Social profiles", facts.socialLinks) + `\n${pages}`;
}

function renderBrandKit(brand: BrandContext["brand"]): string {
  const location = brand.business.location;
  const place = [location?.city, location?.region, location?.country].filter(Boolean).join(", ");
  return (
    line("Name", brand.name) +
    line("Website", brand.url) +
    line("Industry", brand.industry) +
    line("Location", place) +
    line("Tagline", brand.brand.tagline) +
    line("Summary", brand.brand.summary) +
    line("Audience (from the website)", brand.brand.audience) +
    line("Voice", brand.brand.voice) +
    line("Keywords", brand.brand.keywords) +
    line("Platforms in use", brand.platforms)
  );
}

/** The brand kit and, when the brand came from a scan, what the scanner read; all inside one <site> block. */
export function renderSite(input: BrandContext): string {
  const facts = input.siteFacts ? `\n${renderSiteFacts(input.siteFacts)}` : "\nNo website scan on file for this brand.\n";
  return asDataBlock("site", renderBrandKit(input.brand) + facts);
}

/** An earlier research document, so a re-run improves on it instead of starting over. */
export function renderPrevious(label: string, document: GrowthBrief | AudienceProfile): string {
  return asDataBlock("brief", `${label} (from an earlier run; update it, do not repeat it)\n${JSON.stringify(document, null, 2)}`);
}

/** The one user message of the diagnose step. */
export function renderDiscoveryInput(input: BrandContext): string {
  const parts = [
    "Diagnose this business and write its growth brief. Research the competitors and the reviews first, within the tool budget, then answer.",
    renderIntake(input.intake),
    renderSite(input),
  ];
  if (input.research.brief) parts.push(renderPrevious("Previous growth brief", input.research.brief));
  return parts.join("\n\n");
}
