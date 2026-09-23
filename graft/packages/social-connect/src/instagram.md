# packages/social-connect/src/instagram.ts

- InstagramConfig · interface · L17-L24 — interface InstagramConfig
- createInstagramProvider · function · L55-L95 — function createInstagramProvider(config: InstagramConfig): Provider
- authorizeUrl · method · L62-L72 — authorizeUrl(state: string): string
- exchange · method · L75-L87 — async exchange(code: string): Promise<ConnectedAccount>
- refresh · method · L90-L93 — async refresh(token: OAuthToken): Promise<OAuthToken>
- exchangeCode · function · L97-L107 — async function exchangeCode(config: InstagramConfig, code: string)
- exchangeForLongLived · function · L109-L112 — async function exchangeForLongLived(config: InstagramConfig, shortLivedToken: string): Promise<OAuthToken>
- fetchProfile · function · L114-L117 — async function fetchProfile(accessToken: string)
