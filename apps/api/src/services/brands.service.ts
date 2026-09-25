import type { BrandRow, NewBrandRow, SocialAccountRow } from "@social-agent/db";
import { DEFAULT_ACCENT, type Brand, type BrandKit, type BrandPatch, type NewBrandInput } from "@social-agent/shared";
import { config } from "@/config/constants";
import { BrandsRepository } from "@/repositories/brands.repository";
import { SocialAccountsRepository } from "@/repositories/social-accounts.repository";
import { ScansRepository } from "@/repositories/scans.repository";
import { ScansService } from "@/services/scans.service";
import type { AuthUser } from "@/services/users.service";
import type { BrandScope } from "@/types/scope";
import { AppError } from "@/utils/AppError";
import { isUuid } from "@/utils";

export class BrandsService {
    static async list(user: AuthUser): Promise<Brand[]> {
        const scope = scopeFor(user);
        const rows = await BrandsRepository.list(scope);
        return withAccounts(rows);
    }

    /** Only the brands one person owns. Used for "my brands" (even for an admin) and for an admin looking at a client. */
    static async listOwnedBy(ownerId: string): Promise<Brand[]> {
        const rows = await BrandsRepository.list({ ownerId });
        return withAccounts(rows);
    }

    
    static async create(user: AuthUser, input: NewBrandInput, ownerId: string = user.id): Promise<Brand> {
        const { scanId, ...brand } = input;
        const scan = scanId ? await ScansService.claim(user, scanId) : undefined;

        const accent = accentFor(brand.brand);
        const row = await BrandsRepository.create({
            ...brand,
            ownerId,
            createdBy: user.id,
            accent,
        });
        if (scan) await ScansRepository.attachBrand(scan.id, row.id);
        return toBrand(row, []);
    }

    static async get(user: AuthUser, id: string): Promise<Brand> {
        const row = await BrandsService.findRow(user, id);
        return brandWithAccounts(row);
    }

    /** The brand row the caller may reach, or 404. Every brand-scoped service starts here. */
    static async findRow(user: AuthUser, id: string): Promise<BrandRow> {
        if (!isUuid(id)) throw brandNotFound();
        const scope = scopeFor(user);
        const row = await BrandsRepository.findById(id, scope);
        if (!row) throw brandNotFound();
        return row;
    }

    /** `patch` holds only the fields an owner may change; the zod schema dropped everything else. */
    static async update(user: AuthUser, id: string, patch: BrandPatch): Promise<Brand> {
        if (!isUuid(id)) throw brandNotFound();

        const changes: Partial<NewBrandRow> = { ...patch };
        if (patch.brand) changes.accent = accentFor(patch.brand);
        // An edited questionnaire needs the Account Manager's approval again before research re-runs.
        if (patch.questionnaire) changes.questionnaireApprovedAt = null;

        const scope = scopeFor(user);
        const row = await BrandsRepository.update(id, scope, changes);
        if (!row) throw brandNotFound();
        return brandWithAccounts(row);
    }

    static async archive(user: AuthUser, id: string): Promise<void> {
        if (!isUuid(id)) throw brandNotFound();

        const scope = scopeFor(user);
        const archived = await BrandsRepository.archive(id, scope);
        if (!archived) throw brandNotFound();
    }
}

/**
 * THE OWNERSHIP RULE. An admin reaches every brand; everyone else only the
 * brands they own. Every repository call above takes this scope.
 */
export function scopeFor(user: AuthUser): BrandScope {
    return user.role === "admin" ? "all" : { ownerId: user.id };
}

/** "Missing", "archived" and "not yours" get the same answer, so nobody can probe for ids. */
function brandNotFound() {
    return new AppError("This brand doesn't exist, or you don't have access to it.", 404, "BRAND_NOT_FOUND");
}

/** The workspace accent always follows the first brand colour. */
function accentFor(brand: BrandKit) {
    return brand.colors[0]?.hex ?? DEFAULT_ACCENT;
}

async function withAccounts(rows: BrandRow[]): Promise<Brand[]> {
    const brandIds = rows.map((row) => row.id);
    const accounts = await SocialAccountsRepository.listVisibleByBrands(brandIds);
    return rows.map((row) => {
        const brandAccounts = accounts.filter((account) => account.brandId === row.id);
        return toBrand(row, brandAccounts);
    });
}

async function brandWithAccounts(row: BrandRow): Promise<Brand> {
    const [brand] = await withAccounts([row]);
    return brand as Brand;
}

// `listVisibleByBrands` already left out disconnected rows.
function toAccount(row: SocialAccountRow): Brand["accounts"][number] {
    return {
        platform: row.platform,
        handle: row.handle,
        status: row.status === "expired" ? "expired" : "connected",
        connectedAt: row.connectedAt.toISOString(),
    };
}

/** Database row to the `Brand` shape the web app expects. */
function toBrand(row: BrandRow, accounts: SocialAccountRow[]): Brand {
    return {
        id: row.id,
        ownerId: row.ownerId,
        createdBy: row.createdBy,
        name: row.name,
        url: row.url,
        industry: row.industry,
        accent: row.accent,
        status: row.status,
        stage: row.stage,
        brand: row.brand,
        business: row.business,
        platforms: row.platforms,
        preferences: row.preferences,
        questionnaire: row.questionnaire ?? null,
        questionnaireApprovedAt: row.questionnaireApprovedAt?.toISOString() ?? null,
        createdAt: row.createdAt.toISOString(),
        accounts: accounts.map(toAccount),
        stats: config.brand.EMPTY_STATS,
    };
}
