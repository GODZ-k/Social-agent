import { z } from "zod";
import { getJson, postForm } from "./http.js";
import type { ConnectedAccount, OAuthToken, Provider } from "./types.js";

// "Instagram API with Instagram Login": no Facebook Page involved. Verified against Meta docs 2026-09-23.
const NETWORK = "Instagram";
const AUTHORIZE_URL = "https://www.instagram.com/oauth/authorize";
const TOKEN_URL = "https://api.instagram.com/oauth/access_token";
const GRAPH_URL = "https://graph.instagram.com";

export const INSTAGRAM_DEFAULT_SCOPES = [
  "instagram_business_basic",
  "instagram_business_content_publish",
  "instagram_business_manage_insights",
] as const;

export interface InstagramConfig {
  /** Instagram App ID, not the Facebook App ID. */
  appId: string;
  appSecret: string;
  /** Must match the Meta app exactly. */
  redirectUri: string;
  scopes?: readonly string[];
}

const scopeList = z
  .union([z.string(), z.array(z.string())])
  .transform((value) => (Array.isArray(value) ? value : value.split(",")).map((s) => s.trim()).filter(Boolean));

// Documented as `{ data: [ {...} ] }`; older responses were flat.
const shortLivedSchema = z.preprocess(
  (body) => (body && typeof body === "object" && "data" in body ? (body as { data: unknown[] }).data[0] : body),
  z.object({
    access_token: z.string().min(1),
    user_id: z.coerce.string().min(1),
    permissions: scopeList.default([]),
  }),
);

// No refresh token on Instagram: the access token refreshes itself.
const longLivedSchema = z
  .object({ access_token: z.string().min(1), expires_in: z.number().positive() })
  .transform((data): OAuthToken => ({
    accessToken: data.access_token,
    refreshToken: null,
    expiresAt: new Date(Date.now() + data.expires_in * 1000),
  }));

const profileSchema = z.object({
  username: z.string().min(1),
  name: z.string().nullish(),
  profile_picture_url: z.string().nullish(),
});

export function createInstagramProvider(config: InstagramConfig): Provider {
  const scopes = config.scopes ?? INSTAGRAM_DEFAULT_SCOPES;

  return {
    network: "instagram",
    scopes,

    authorizeUrl(state: string): string {
      const url = new URL(AUTHORIZE_URL);
      const scope = scopes.join(",");
      url.search = new URLSearchParams({
        client_id: config.appId,
        redirect_uri: config.redirectUri,
        response_type: "code",
        scope,
        state,
      }).toString();
      return url.href;
    },

    // Three Meta calls: short-lived token, 60-day token, profile.
    async exchange(code: string): Promise<ConnectedAccount> {
      const short = await exchangeCode(config, code);
      const token = await exchangeForLongLived(config, short.access_token);
      const profile = await fetchProfile(token.accessToken);
      return {
        externalAccountId: short.user_id,
        handle: profile.username,
        name: profile.name ?? null,
        avatarUrl: profile.profile_picture_url ?? null,
        token,
        scopes: short.permissions,
      };
    },

    // Allowed once the token is a day old and before it expires.
    async refresh(token: OAuthToken): Promise<OAuthToken> {
      const query = { grant_type: "ig_refresh_token", access_token: token.accessToken };
      const body = await getJson(NETWORK, `${GRAPH_URL}/refresh_access_token`, query);
      return longLivedSchema.parse(body);
    },
  };
}

async function exchangeCode(config: InstagramConfig, code: string) {
  // Meta appends `#_` to the redirect.
  const authCode = code.replace(/#_$/, "");
  const form = new URLSearchParams({
    client_id: config.appId,
    client_secret: config.appSecret,
    grant_type: "authorization_code",
    redirect_uri: config.redirectUri,
    code: authCode,
  });
  const body = await postForm(NETWORK, TOKEN_URL, form);
  return shortLivedSchema.parse(body);
}

async function exchangeForLongLived(config: InstagramConfig, shortLivedToken: string): Promise<OAuthToken> {
  const query = { grant_type: "ig_exchange_token", client_secret: config.appSecret, access_token: shortLivedToken };
  const body = await getJson(NETWORK, `${GRAPH_URL}/access_token`, query);
  return longLivedSchema.parse(body);
}

async function fetchProfile(accessToken: string) {
  const query = { fields: "user_id,username,name,profile_picture_url", access_token: accessToken };
  const body = await getJson(NETWORK, `${GRAPH_URL}/me`, query);
  return profileSchema.parse(body);
}
