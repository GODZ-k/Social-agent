import { NOT_SURE, type BrandKit, type BusinessInfo, type Intake, type IntakeQuestion, type IntakeSession, type Language } from "@social-agent/shared";
import { asDataBlock } from "../prompt-text.js";

/** What the Account Manager knows about a business before it talks to the owner. */
export type IntakeContext = {
  brandName: string;
  industry: string;
  url: string;
  brandKit: BrandKit;
  business: BusinessInfo;
  /** Pages the scan read, titles only: they show what the site covers. */
  pagesRead: { url: string; title: string }[];
  chatLanguage: Language;
};

const LANGUAGE_NAMES: Record<Language, string> = {
  en: "English (very simple, primary-school level)",
  hi: "Hindi, in Devanagari script, everyday spoken Hindi",
  hinglish: "Hinglish: Hindi words written in English letters",
};

function line(label: string, value: string | undefined): string {
  return value ? `${label}: ${value}\n` : "";
}

function knownOrMissing(label: string, value: string | undefined): string {
  return `${label}: ${value ?? "not on the website"}\n`;
}

function location(business: BusinessInfo): string | undefined {
  const where = business.location;
  if (!where) return undefined;
  return [where.address, where.city, where.region, where.country].filter(Boolean).join(", ") || undefined;
}

/** The brand as the scan found it, inside a data block. */
function renderSite(context: IntakeContext): string {
  const kit = context.brandKit;
  const text =
    line("Business name", context.brandName) +
    line("Industry", context.industry) +
    line("Website", context.url) +
    line("Tagline", kit.tagline) +
    line("Summary", kit.summary) +
    line("Audience (first guess)", kit.audience) +
    line("Voice", kit.voice.join(", ")) +
    line("Keywords", kit.keywords?.join(", ")) +
    knownOrMissing("Phone", context.business.phone) +
    knownOrMissing("Email", context.business.email) +
    knownOrMissing("Location", location(context.business)) +
    knownOrMissing("Opening hours", context.business.hours?.length ? `${context.business.hours.length} days listed` : undefined) +
    `Pages the scan read:\n${context.pagesRead.map((page) => `- ${page.title} (${page.url})`).join("\n") || "- none"}\n`;
  return asDataBlock("site", text);
}

/** Call 1: write the questions for this brand. */
export function renderQuestionsPrompt(context: IntakeContext): string {
  const country = context.business.location?.country ?? "unknown";
  return [
    "Job: write the intake questions.",
    `Chat language: ${LANGUAGE_NAMES[context.chatLanguage]}`,
    `Country (for the currency of money ranges): ${country}`,
    "",
    renderSite(context),
  ].join("\n");
}

function renderRange(option: { min?: number; max?: number }, currency: string | undefined): string {
  return ` (min ${option.min ?? "none"}, max ${option.max ?? "none"}, ${currency ?? "currency unknown"})`;
}

function renderAnswer(question: IntakeQuestion, answer: string | undefined): string {
  const value = answer === NOT_SURE ? "Not sure" : (answer ?? "(not answered)");
  const option = question.options?.find((candidate) => candidate.value === answer);
  const numbers = option && question.kind === "range" ? renderRange(option, question.currency) : "";
  const shown = option ? `${option.label} [${option.value}]${numbers}` : value;
  const covers = question.covers.length > 0 ? question.covers.join(", ") : "brand-only";
  const prefill = question.prefill ? `\nWebsite says: ${question.prefill}` : "";
  return `Q ${question.id} (${question.kind}, covers: ${covers}): ${question.text}${prefill}\nA: ${shown}\n`;
}

/** The intake the owner edited in Settings after the interview, as plain lines for the review. */
function renderEditedIntake(intake: Intake): string {
  const lines = Object.entries(intake).map(([key, value]) => `${key}: ${typeof value === "string" ? value : JSON.stringify(value)}`);
  return asDataBlock("intake", lines.join("\n"));
}

/**
 * Call 2: review the answers and read the facts out of them. `editedIntake` is the owner's own later
 * edit in Settings; it replaces the interview answers wherever they differ.
 */
export function renderReviewPrompt(context: IntakeContext, session: IntakeSession, finalRound: boolean, editedIntake?: Intake): string {
  const questions = session.questions.map((question) => renderAnswer(question, session.answers[question.id])).join("\n");
  const followUps = session.followUps.map((question) => renderAnswer(question, session.answers[question.id])).join("\n");
  const answers = followUps ? `${questions}\nFollow-up questions:\n${followUps}` : questions;
  const header = ["Job: review the answers."];
  if (finalRound) header.push("This is the final round: approve unless a required fact is truly missing.");
  header.push(`Chat language for any follow-up: ${LANGUAGE_NAMES[session.chatLanguage]}`);
  if (editedIntake) header.push("The owner edited the facts in <intake> in Settings after the interview. Review those facts; where they differ from the answers, the <intake> block is the owner's latest word.");
  const blocks = [renderSite(context), asDataBlock("answers", answers || "(no interview answers)")];
  if (editedIntake) blocks.push(renderEditedIntake(editedIntake));
  return [...header, "", blocks.join("\n\n")].join("\n");
}
