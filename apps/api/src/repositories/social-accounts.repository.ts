import { socialAccounts, type NewSocialAccountRow, type SocialAccountRow } from "@social-agent/db";
import type { Platform } from "@social-agent/shared";
import { and, asc, eq, inArray } from "drizzle-orm";
import { db } from "@/config/db";
import { insertedRow } from "@/utils";

// The service checks the brand against the caller before calling anything here.
export class SocialAccountsRepository {
    static async listByBrand(brandId: string): Promise<SocialAccountRow[]> {
        return db.select().from(socialAccounts).where(eq(socialAccounts.brandId, brandId)).orderBy(asc(socialAccounts.platform));
    }

    /** For `Brand.accounts`: one query for many brands, disconnected rows left out. */
    static async listVisibleByBrands(brandIds: string[]): Promise<SocialAccountRow[]> {
        if (brandIds.length === 0) return [];
        const accountFilter = and(inArray(socialAccounts.brandId, brandIds), inArray(socialAccounts.status, ["connected", "expired"]));
        return db
            .select()
            .from(socialAccounts)
            .where(accountFilter)
            .orderBy(asc(socialAccounts.platform));
    }

    static async findByBrandPlatform(brandId: string, platform: Platform): Promise<SocialAccountRow | undefined> {
        const accountFilter = and(eq(socialAccounts.brandId, brandId), eq(socialAccounts.platform, platform));
        return db.query.socialAccounts.findFirst({
            where: accountFilter,
        });
    }

    static async findByExternalAccount(platform: Platform, externalAccountId: string): Promise<SocialAccountRow | undefined> {
        const accountFilter = and(eq(socialAccounts.platform, platform), eq(socialAccounts.externalAccountId, externalAccountId));
        return db.query.socialAccounts.findFirst({
            where: accountFilter,
        });
    }

    /** A reconnect overwrites the row. */
    static async upsertConnected(values: NewSocialAccountRow): Promise<SocialAccountRow> {
        const connected = { ...values, status: "connected" as const, connectedAt: new Date(), updatedAt: new Date() };
        const rows = await db
            .insert(socialAccounts)
            .values(connected)
            .onConflictDoUpdate({ target: [socialAccounts.brandId, socialAccounts.platform], set: connected })
            .returning();
        return insertedRow(rows, "social_accounts");
    }

    // The row stays: metrics history hangs off it.
    static async disconnect(id: string): Promise<void> {
        await db
            .update(socialAccounts)
            .set({ accessTokenEnc: null, refreshTokenEnc: null, tokenExpiresAt: null, status: "disconnected", updatedAt: new Date() })
            .where(eq(socialAccounts.id, id));
    }
}
