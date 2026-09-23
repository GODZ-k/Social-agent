import type { BrandRow, NewBrandRow, SocialAccountRow } from "@social-agent/db";
import { DEFAULT_ACCENT, type Brand, type BrandKit, type BrandPatch, type NewBrandInput } from "@social-agent/shared";
import { BrandsRepository, type BrandScope } from "@/repositories/brands.repository";
import { SocialAccountsRepository } from "@/repositories/social-accounts.repository";
import { ScansRepository } from "@/repositories/scans.repository";
import { ScansService } from "@/services/scans.service";
import type { AuthUser } from "@/services/users.service";
import { AppError } from "@/utils/AppError";
import { isUuid } from "@/utils";

export class BrandsService {
    static async list(user: AuthUser): Promise<Brand[]> {
        const rows = await BrandsRepository.list(scopeFor(user));
        return withAccounts(rows);
    }

    /** Only the brands one person owns. Used for "my brands" (even for an admin) and for an admin looking at a client. */
    static async listOwnedBy(ownerId: string): Promise<Brand[]> {
        const rows = await BrandsRepository.list({ ownerId });
        return withAccounts(rows);
    }

    /**
     * `ownerId` defaults to the caller. An admin setting a brand up for a client passes the
     * client's id; `createdBy` still records the admin. A client may own any number of brands.
     * `input.scanId`, when given, must be a scan the caller (or an admin) may claim: done, and
     * requested by them (`ScansService.claim`). The scan is linked to the new brand afterwards.
     */
    static async create(user: AuthUser, input: NewBrandInput, ownerId: string = user.id): Promise<Brand> {
        const { scanId, ...brand } = input;
        const scan = scanId ? await ScansService.claim(user, scanId) : undefined;

        const row = await BrandsRepository.create({
            ...brand,
            ownerId,
            createdBy: user.id,
            accent: accentFor(brand.brand),
        });
        if (scan) await ScansRepository.attachBrand(scan.id, row.id);
        return toBrand(row, []);
    }

    static async get(user: AuthUser, id: string): Promise<Brand> {
        if (!isUuid(id)) throw brandNotFound();

        const row = await BrandsRepository.findById(id, scopeFor(user));
        if (!row) throw brandNotFound();
        return brandWithAccounts(row);
    }

    /** `patch` holds only the fields an owner may change; the zod schema dropped everything else. */
    static async update(user: AuthUser, id: string, patch: BrandPatch): Promise<Brand> {
        if (!isUuid(id)) throw brandNotFound();

        const changes: Partial<NewBrandRow> = { ...patch };
        if (patch.brand) changes.accent = accentFor(patch.brand);

        const row = await BrandsRepository.update(id, scopeFor(user), changes);
        if (!row) throw brandNotFound();
        return brandWithAccounts(row);
    }

    static async archive(user: AuthUser, id: string): Promise<void> {
        if (!isUuid(id)) throw brandNotFound();

        const archived = await BrandsRepository.archive(id, scopeFor(user));
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

/** Real values arrive with the social accounts and analytics tables (phases 3 and 5). */
const EMPTY_STATS: Brand["stats"] = {
    followers: 0,
    followersDelta: 0,
    engagementRate: 0,
    engagementDelta: 0,
    scheduled: 0,
    pendingApprovals: 0,
};

async function withAccounts(rows: BrandRow[]): Promise<Brand[]> {
    const accounts = await SocialAccountsRepository.listVisibleByBrands(rows.map((row) => row.id));
    return rows.map((row) => toBrand(row, accounts.filter((account) => account.brandId === row.id)));
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
        createdAt: row.createdAt.toISOString(),
        accounts: accounts.map(toAccount),
        stats: EMPTY_STATS,
    };
}
