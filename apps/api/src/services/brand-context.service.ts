import type { BrandRow, BrandScanRow } from "@social-agent/db";
import type { AudienceProfile, BrandContext, GrowthBrief, SiteFacts } from "@social-agent/shared";
import { BrandsRepository } from "@/repositories/brands.repository";
import { ResearchRepository } from "@/repositories/research.repository";
import { ScansRepository } from "@/repositories/scans.repository";

export class BrandContextService {
    /**
     * Everything Cadence knows about one brand's business, in the shape every agent takes. A brand
     * without an approved intake has no context yet: research and the agents after it need one.
     */
    static async load(brandId: string): Promise<BrandContext | undefined> {
        const brand = await BrandsRepository.findById(brandId, "all");
        if (!brand) throw new Error(`brand ${brandId} does not exist or is archived`);
        if (!brand.intake || !brand.intakeApprovedAt) return undefined;

        const [scan, brief, profile] = await Promise.all([
            ScansRepository.findLatestDoneForBrand(brandId),
            ResearchRepository.latestResearch(brandId, "growth_brief"),
            ResearchRepository.latestResearch(brandId, "audience_profile"),
        ]);

        return {
            brand: pickBrand(brand),
            intake: brand.intake,
            siteFacts: siteFactsFromScan(scan),
            research: {
                brief: brief ? (brief.content as GrowthBrief) : null,
                profile: profile ? (profile.content as AudienceProfile) : null,
            },
        };
    }
}

function pickBrand(row: BrandRow): BrandContext["brand"] {
    return {
        name: row.name,
        url: row.url,
        industry: row.industry,
        brand: row.brand,
        business: row.business,
        platforms: row.platforms,
    };
}

/**
 * What the scan kept: the proposed kit, the business info and the pages' addresses and titles.
 * Page text is not stored, so these facts are thin; the brief's `confidence` is expected to say so.
 */
function siteFactsFromScan(scan: BrandScanRow | undefined): SiteFacts | null {
    if (!scan?.result) return null;
    const { result } = scan;
    return {
        url: scan.url,
        nameCandidates: result.name ? [result.name] : [],
        pages: scan.pages.map((page) => ({
            url: page.url,
            title: page.title,
            og: {},
            schemaNames: [],
            headings: [],
            text: "",
            wordCount: 0,
            phones: [],
            emails: [],
            socialLinks: [],
        })),
        style: { colors: result.brand.colors.map((color) => color.hex), fonts: result.brand.fonts },
        business: result.business,
        socialLinks: [],
    };
}
