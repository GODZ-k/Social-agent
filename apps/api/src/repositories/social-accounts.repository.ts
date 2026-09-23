import { socialAccounts, type NewSocialAccountRow, type SocialAccountRow } from "@social-agent/db";
import type { Platform } from "@social-agent/shared";
import { and, asc, eq, inArray } from "drizzle-orm";
import { db } from "@/config/db";

// The service checks the brand against the caller before calling anything here.
export class SocialAccountsRepository {
    static async listByBrand(brandId: string): Promise<SocialAccountRow[]> {
        return db.select().from(socialAccounts).where(eq(socialAccounts.brandId, brandId)).orderBy(asc(socialAccounts.platform));
    }

    /** For `Brand.accounts`: one query for many brands, disconnected rows left out. */
    static async listVisibleByBrands(brandIds: string[]): Promise<SocialAccountRow[]> {
        if (brandIds.length === 0) return [];
        return db
            .select()
            .from(socialAccounts)
            .where(and(inArray(socialAccounts.brandId, brandIds), inArray(socialAccounts.status, ["connected", "expired"])))
            .orderBy(asc(socialAccounts.platform));
    }

    static async findByBrandPlatform(brandId: string, platform: Platform): Promise<SocialAccountRow | undefined> {
        const [row] = await db
            .select()
            .from(socialAccounts)
            .where(and(eq(socialAccounts.brandId, brandId), eq(socialAccounts.platform, platform)))
            .limit(1);
        return row;
    }

    static async findByExternalAccount(platform: Platform, externalAccountId: string): Promise<SocialAccountRow | undefined> {
        const [row] = await db
            .select()
            .from(socialAccounts)
            .where(and(eq(socialAccounts.platform, platform), eq(socialAccounts.externalAccountId, externalAccountId)))
            .limit(1);
        return row;
    }

    /** A reconnect overwrites the row. */
    static async upsertConnected(values: NewSocialAccountRow): Promise<SocialAccountRow> {
        const connected = { ...values, status: "connected" as const, connectedAt: new Date(), updatedAt: new Date() };
        const [row] = await db
            .insert(socialAccounts)
            .values(connected)
            .onConflictDoUpdate({ target: [socialAccounts.brandId, socialAccounts.platform], set: connected })
            .returning();
        if (!row) throw new Error("Upsert into social_accounts returned no row");
        return row;
    }

    // The row stays: metrics history hangs off it.
    static async disconnect(id: string): Promise<void> {
        await db
            .update(socialAccounts)
            .set({ accessTokenEnc: null, refreshTokenEnc: null, tokenExpiresAt: null, status: "disconnected", updatedAt: new Date() })
            .where(eq(socialAccounts.id, id));
    }
}
