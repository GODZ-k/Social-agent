export type Network = "instagram" | "facebook" | "linkedin" | "tiktok";

export interface OAuthToken {
  accessToken: string;
  /** Null when the access token refreshes itself (Instagram). */
  refreshToken: string | null;
  expiresAt: Date;
}

/** The caller stores this; the package never does. */
export interface ConnectedAccount {
  /** Stable across reconnects. */
  externalAccountId: string;
  handle: string;
  name: string | null;
  avatarUrl: string | null;
  token: OAuthToken;
  /** What the person granted; compare with `Provider.scopes`. */
  scopes: string[];
}

/** Send the browser to `authorizeUrl`, `exchange` the code, `refresh` before `expiresAt`. */
export interface Provider {
  network: Network;
  scopes: readonly string[];
  /** `state` is yours to sign and check. */
  authorizeUrl(state: string): string;
  exchange(code: string): Promise<ConnectedAccount>;
  refresh(token: OAuthToken): Promise<OAuthToken>;
}
