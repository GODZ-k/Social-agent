import type { BrandContext, GrowthBrief } from "@social-agent/shared";
import { renderAnswers, renderPrevious, renderSite } from "../growth-consultant/prompt.js";
import { asDataBlock } from "../prompt-text.js";

/** The intake answers the researcher works from: the offer, the ideal customer, the competitors, the constraints. */
const INTAKE_KEYS = ["offer", "idealCustomer", "competitors", "constraints"] as const;

/** The brief the Growth Consultant just wrote, as the profile's starting point. */
function renderBrief(brief: GrowthBrief): string {
  return asDataBlock("brief", `Growth brief for this run\n${JSON.stringify(brief, null, 2)}`);
}

/** The one user message of the profile step. */
export function renderProfileInput(input: BrandContext, brief: GrowthBrief): string {
  const parts = [
    "Build the audience profile for this business. Read the brief, then research the reviews and the competitors' audiences within the tool budget, then answer.",
    renderBrief(brief),
    asDataBlock("intake", renderAnswers(input.intake, INTAKE_KEYS)),
    renderSite(input),
  ];
  if (input.research.profile) parts.push(renderPrevious("Previous audience profile", input.research.profile));
  return parts.join("\n\n");
}
