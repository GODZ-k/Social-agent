import type { BrandResearchRow, ResearchRunRow } from "@social-agent/db";
import type { AudienceProfile, GrowthBrief, Research } from "@social-agent/shared";
import { ResearchRepository } from "@/repositories/research.repository";
import { enqueueResearch } from "@/research-queue";
import { BrandsService } from "@/services/brands.service";
import type { AuthUser } from "@/services/users.service";
import { AppError } from "@/utils/AppError";
import { isUniqueViolation, isoOrNull } from "@/utils";

export class ResearchService {
    /**
     * Starts business discovery for a brand, or returns the run it already has going: one active
     * run per brand. Needs the questionnaire the Account Manager approved; a website cannot tell us what the owner wants.
     */
    static async start(user: AuthUser, brandId: string): Promise<{ research: Research; created: boolean }> {
        const brand = await BrandsService.findRow(user, brandId);
        if (!brand.questionnaire || !brand.questionnaireApprovedAt) throw new AppError("Answer the questionnaire before research can start.", 409, "QUESTIONNAIRE_REQUIRED");

        const active = await ResearchRepository.findActiveRunFor(brand.id);
        if (active) return { research: await toResearch(brand.id, active), created: false };

        const row = await createRunOnce(brand.id, user.id);
        if (!row) {
            const run = await ResearchRepository.findActiveRunFor(brand.id);
            return { research: await toResearch(brand.id, run), created: false };
        }
        enqueueResearch(row.id);
        return { research: await toResearch(brand.id, row), created: true };
    }

    /** The latest run's state plus the latest brief and profile. `status` is null when nothing ever ran. */
    static async get(user: AuthUser, brandId: string): Promise<Research> {
        const brand = await BrandsService.findRow(user, brandId);
        const run = await ResearchRepository.findLatestRunFor(brand.id);
        return toResearch(brand.id, run);
    }
}

/** The database allows one active run per brand; a request that loses that race gets no row. */
async function createRunOnce(brandId: string, requestedBy: string): Promise<ResearchRunRow | undefined> {
    try {
        return await ResearchRepository.createRun({ brandId, requestedBy });
    } catch (error) {
        if (isUniqueViolation(error)) return undefined;
        throw error;
    }
}

/** One stored version. The row's `content` is typed by its `kind`; the caller names which. */
function toVersion<T>(row: BrandResearchRow | undefined) {
    if (!row) return null;
    return { version: row.version, content: row.content as T, sources: row.sources, createdAt: row.createdAt.toISOString() };
}

/** Run row and latest research rows to the `Research` shape the web app expects. */
async function toResearch(brandId: string, run: ResearchRunRow | undefined): Promise<Research> {
    const [brief, profile] = await Promise.all([
        ResearchRepository.latestResearch(brandId, "growth_brief"),
        ResearchRepository.latestResearch(brandId, "audience_profile"),
    ]);

    return {
        brandId,
        status: run?.status ?? null,
        currentStep: run?.currentStep ?? null,
        error: run?.error ?? null,
        growthBrief: toVersion<GrowthBrief>(brief),
        audienceProfile: toVersion<AudienceProfile>(profile),
        startedAt: isoOrNull(run?.startedAt),
        finishedAt: isoOrNull(run?.finishedAt),
    };
}
