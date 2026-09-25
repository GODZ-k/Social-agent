import { createStep } from "@mastra/core/workflows";
import { scanResultSchema, type ScanResult } from "@social-agent/shared";
import { config } from "@/config/constants";
import type { SiteFacts } from "@/scan/types";
import {
  AnswerRejectedError,
  BRAND_ANALYST_LIMITS,
  brandAnalysisSchema,
  generateStructured,
  isAnswerRejected,
  renderSiteFacts,
  type BrandAnalysis,
} from "@social-agent/agents";
import { brandAnalyst } from "@/mastra/agents/team";
import { interpretOutputSchema, readPagesOutputSchema } from "../schemas";

type VoiceWord = BrandAnalysis["voice"][number];

// Curly quotes, long dashes and runs of spaces differ between the page and the model's copy.
function normalise(text: string): string {
  return text
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

/** Everything the model was shown from the site, as one searchable string. */
function siteWords(facts: SiteFacts): string {
  const parts = facts.pages.flatMap((page) => [page.title, page.description ?? "", page.og.description ?? "", ...page.headings, page.text]);
  return normalise(parts.join(" "));
}

function isOnSite(quote: string, words: string): boolean {
  const phrase = normalise(quote).replace(/^["'\s]+|["'.,!?;:\s]+$/g, "");
  return phrase.length > 0 && words.includes(phrase);
}

function splitVoice(voice: VoiceWord[], words: string): { supported: VoiceWord[]; unsupported: VoiceWord[] } {
  const supported = voice.filter((word) => isOnSite(word.quote, words));
  return { supported, unsupported: voice.filter((word) => !supported.includes(word)) };
}

/** The first answer must prove enough of its voice; the retry is kept either way and filtered by the step. */
function requireSupportedVoice(analysis: BrandAnalysis, words: string): void {
  const { supported, unsupported } = splitVoice(analysis.voice, words);
  if (supported.length >= BRAND_ANALYST_LIMITS.MIN_VOICE_WORDS) return;
  const missing = unsupported.map((word) => `"${word.quote}" (${word.adjective})`).join(", ");
  throw new AnswerRejectedError(`These voice quotes are not on the site: ${missing}. Copy each quote word for word from inside <site>.`);
}

/** The model's judgement plus the facts code extracted. The model never supplies a fact. */
function assemble(analysis: BrandAnalysis, facts: SiteFacts, voice: VoiceWord[]): ScanResult {
  return scanResultSchema.parse({
    name: analysis.name.trim() || facts.nameCandidates[0],
    industry: analysis.industry.trim() || undefined,
    brand: {
      tagline: analysis.tagline,
      summary: analysis.summary,
      audience: analysis.audience,
      voice: voice.map((word) => word.adjective.trim()),
      // Hex values and their order come from the CSS. A missing name falls back to the hex.
      colors: facts.style.colors.map((hex, index) => ({ name: analysis.colorNames[index]?.trim() || hex, hex })),
      fonts: facts.style.fonts,
      aesthetic: analysis.aesthetic,
      keywords: analysis.keywords,
    },
    ...(facts.business ? { business: facts.business } : {}),
  });
}

export const interpretStep = createStep({
  id: "interpret",
  description: "The Brand Analyst turns the facts into a brand kit. Code then adds the contact details, colour values and fonts it extracted.",
  inputSchema: readPagesOutputSchema,
  outputSchema: interpretOutputSchema,
  execute: async ({ inputData, mastra }) => {
    const { facts, warnings } = inputData;
    if (inputData.failure || !facts) return { failure: inputData.failure, pages: [], warnings };

    const pages = facts.pages.map((page) => ({ url: page.url, title: page.title }));
    const agent = mastra?.getAgent("brandAnalyst") ?? brandAnalyst;
    const logger = mastra?.getLogger();
    const words = siteWords(facts);

    try {
      const analysis = await generateStructured(agent, renderSiteFacts(facts), brandAnalysisSchema, {
        // No tools here, so the schema goes through the provider's native structured output, as before.
        jsonPromptInjection: false,
        checkFirstAnswer: (answer) => requireSupportedVoice(answer, words),
        onRejected: (message) => {
          logger?.warn(`brand-scan interpret: the model's answer was rejected, asking once more: ${message}`);
        },
      });
      const { supported, unsupported } = splitVoice(analysis.voice, words);
      if (unsupported.length > 0) {
        logger?.warn(`brand-scan interpret: dropped voice words with no quote on the site: ${unsupported.map((word) => word.adjective).join(", ")}`);
      }
      const voiceWarnings = supported.length === 0 ? [config.scan.NO_VOICE_WARNING] : [];
      return { result: assemble(analysis, facts, supported), pages, warnings: [...warnings, ...voiceWarnings] };
    } catch (error) {
      if (!isAnswerRejected(error)) throw error;
      logger?.warn(`brand-scan interpret: the model's second answer was rejected too: ${error.message}`);
      return { failure: { code: "INTERPRETATION_FAILED" as const, message: config.scan.MESSAGES.INTERPRETATION_FAILED }, pages, warnings };
    }
  },
});
