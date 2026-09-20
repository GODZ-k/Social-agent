import type { ClientRow, NewClientRow } from "@social-agent/db";
import { DEFAULT_ACCENT, type BrandKit, type Client, type ClientPatch, type NewClientInput } from "@social-agent/shared";
import { z } from "zod";
import { ClientsRepository, type ClientScope } from "@/repositories/clients.repository";
import type { AuthUser } from "@/services/users.service";
import { AppError } from "@/utils/AppError";

export class ClientsService {
    static async list(user: AuthUser): Promise<Client[]> {
        const rows = await ClientsRepository.list(scopeFor(user));
        return rows.map(toClient);
    }

    static async create(user: AuthUser, input: NewClientInput): Promise<Client> {
        const row = await ClientsRepository.create({
            ...input,
            ownerId: user.id,
            accent: accentFor(input.brand),
        });
        return toClient(row);
    }

    static async get(user: AuthUser, id: string): Promise<Client> {
        if (!isUuid(id)) throw clientNotFound();

        const row = await ClientsRepository.findById(id, scopeFor(user));
        if (!row) throw clientNotFound();
        return toClient(row);
    }

    /** `patch` holds only the fields an owner may change; the zod schema dropped everything else. */
    static async update(user: AuthUser, id: string, patch: ClientPatch): Promise<Client> {
        if (!isUuid(id)) throw clientNotFound();

        const changes: Partial<NewClientRow> = { ...patch };
        if (patch.brand) changes.accent = accentFor(patch.brand);

        const row = await ClientsRepository.update(id, scopeFor(user), changes);
        if (!row) throw clientNotFound();
        return toClient(row);
    }

    static async delete(user: AuthUser, id: string): Promise<void> {
        if (!isUuid(id)) throw clientNotFound();

        const deleted = await ClientsRepository.delete(id, scopeFor(user));
        if (!deleted) throw clientNotFound();
    }
}

/**
 * THE OWNERSHIP RULE. An admin reaches every client; everyone else only the
 * clients they own. Every repository call above takes this scope.
 */
function scopeFor(user: AuthUser): ClientScope {
    return user.role === "admin" ? "all" : { ownerId: user.id };
}

/** "Missing" and "not yours" get the same answer, so nobody can probe for ids. */
function clientNotFound() {
    return new AppError("This client doesn't exist, or you don't have access to it.", 404, "CLIENT_NOT_FOUND");
}

/** A malformed id would make Postgres throw, so it is treated as "not found" up front. */
function isUuid(value: string) {
    return z.uuid().safeParse(value).success;
}

/** The workspace accent always follows the first brand colour. */
function accentFor(brand: BrandKit) {
    return brand.colors[0]?.hex ?? DEFAULT_ACCENT;
}

/** Real values arrive with the social accounts and analytics tables (phases 3 and 5). */
const EMPTY_STATS: Client["stats"] = {
    followers: 0,
    followersDelta: 0,
    engagementRate: 0,
    engagementDelta: 0,
    scheduled: 0,
    pendingApprovals: 0,
};

/** Database row to the `Client` shape the web app expects. */
function toClient(row: ClientRow): Client {
    return {
        id: row.id,
        ownerId: row.ownerId,
        name: row.name,
        url: row.url,
        industry: row.industry,
        accent: row.accent,
        stage: row.stage,
        brand: row.brand,
        business: row.business,
        platforms: row.platforms,
        preferences: row.preferences,
        createdAt: row.createdAt.toISOString(),
        accounts: [],
        stats: EMPTY_STATS,
    };
}
