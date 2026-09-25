import type { NewSocialAccountRow, SocialAccountRow } from "@social-agent/db";
import type { ConnectError, ConnectSocialAccountResponse, Platform, SocialAccountDetail } from "@social-agent/shared";
import type { ConnectedAccount, Provider } from "@social-agent/social-connect";
import { config } from "@/config/constants";
import { env } from "@/config/env";
import { SocialAccountsRepository } from "@/repositories/social-accounts.repository";
import { BrandsService } from "@/services/brands.service";
import type { AuthUser } from "@/services/users.service";
import { encryptSecret, socialCryptoReady } from "@/social/crypto";
import { providerFor } from "@/social/providers";
import { createState, readState } from "@/social/state";
import type { OAuthCallbackQuery, OAuthState } from "@/types/social";
import { AppError } from "@/utils/AppError";
import { isUniqueViolation } from "@/utils";

export class SocialAccountsService {
    static async list(user: AuthUser, brandId: string): Promise<SocialAccountDetail[]> {
        await BrandsService.findRow(user, brandId);
        const rows = await SocialAccountsRepository.listByBrand(brandId);
        return rows.map(toDetail);
    }

    /** Step one: the consent URL the browser must visit. Reconnect uses it too. */
    static async connect(user: AuthUser, brandId: string, platform: Platform): Promise<ConnectSocialAccountResponse> {
        await BrandsService.findRow(user, brandId);
        const provider = providerFor(platform);
        if (!provider || !socialCryptoReady()) {
            throw new AppError(`Connecting ${platform} is not available yet.`, 501, "PLATFORM_NOT_AVAILABLE");
        }

        const state = createState({ brandId, userId: user.id, platform });
        return { authorizeUrl: provider.authorizeUrl(state) };
    }

    /** Step two: the network's redirect. Returns where to send the browser; never throws. */
    static async completeConnection(platform: string, query: OAuthCallbackQuery): Promise<string> {
        const state = readState(query.state);
        if (!state || state.platform !== platform) return homeUrl("invalid_state");

        const settings = (error: ConnectError) => settingsUrl(state.brandId, { connect_error: error });
        if (query.error) return settings("denied");
        const provider = providerFor(state.platform);
        if (!query.code || !provider) return settings("failed");

        try {
            const account = await provider.exchange(query.code);
            const problem = await checkAccount(state, provider, account);
            if (problem) return settings(problem);

            const row = toRow(state, account);
            await SocialAccountsRepository.upsertConnected(row);
            return settingsUrl(state.brandId, { connected: platform });
        } catch (err) {
            if (isUniqueViolation(err)) return settings("account_in_use");
            console.error(`Connecting ${platform} for brand ${state.brandId} failed`, err);
            return settings("failed");
        }
    }

    static async disconnect(user: AuthUser, brandId: string, platform: Platform): Promise<void> {
        await BrandsService.findRow(user, brandId);
        const row = await SocialAccountsRepository.findByBrandPlatform(brandId, platform);
        if (!row || row.status === "disconnected") throw accountNotFound();
        await SocialAccountsRepository.disconnect(row.id);
    }
}

function accountNotFound() {
    return new AppError("This account is not connected.", 404, "ACCOUNT_NOT_FOUND");
}

async function checkAccount(state: OAuthState, provider: Provider, account: ConnectedAccount): Promise<ConnectError | null> {
    const missing = provider.scopes.filter((scope) => !account.scopes.includes(scope));
    if (missing.length > 0) return "missing_scopes";

    const current = await SocialAccountsRepository.findByBrandPlatform(state.brandId, state.platform);
    if (current && current.status !== "disconnected" && current.externalAccountId !== account.externalAccountId) return "account_mismatch";

    const owner = await SocialAccountsRepository.findByExternalAccount(state.platform, account.externalAccountId);
    if (owner && owner.brandId !== state.brandId) return "account_in_use";

    return null;
}

function toRow(state: OAuthState, account: ConnectedAccount): NewSocialAccountRow {
    return {
        brandId: state.brandId,
        platform: state.platform,
        externalAccountId: account.externalAccountId,
        handle: account.handle,
        avatarUrl: account.avatarUrl,
        accessTokenEnc: encryptSecret(account.token.accessToken),
        refreshTokenEnc: account.token.refreshToken ? encryptSecret(account.token.refreshToken) : null,
        tokenExpiresAt: account.token.expiresAt,
        scopes: account.scopes,
        meta: account.name ? { name: account.name } : {},
        connectedBy: state.userId,
    };
}

function settingsUrl(brandId: string, params: Record<string, string>): string {
    const url = new URL(`/c/${brandId}/settings`, env.FRONTEND_URL);
    url.search = new URLSearchParams({ tab: config.oauth.SETTINGS_TAB, ...params }).toString();
    return url.href;
}

function homeUrl(error: ConnectError): string {
    const url = new URL("/", env.FRONTEND_URL);
    url.search = new URLSearchParams({ connect_error: error }).toString();
    return url.href;
}

// Tokens, `meta` and the external id never leave the API.
function toDetail(row: SocialAccountRow): SocialAccountDetail {
    return {
        id: row.id,
        platform: row.platform,
        handle: row.handle,
        avatarUrl: row.avatarUrl,
        status: row.status,
        scopes: row.scopes,
        tokenExpiresAt: row.tokenExpiresAt?.toISOString() ?? null,
        connectedBy: row.connectedBy,
        connectedAt: row.connectedAt.toISOString(),
        lastSyncedAt: row.lastSyncedAt?.toISOString() ?? null,
    };
}
