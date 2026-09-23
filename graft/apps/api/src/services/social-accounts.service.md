# apps/api/src/services/social-accounts.service.ts

- SocialAccountsService · class · L17-L66 — class SocialAccountsService
- list · method · L18-L22 — static async list(user: AuthUser, brandId: string): Promise<SocialAccountDetail[]>
- connect · method · L25-L34 — static async connect(user: AuthUser, brandId: string, platform: Platform): Promise<ConnectSocialAccountResponse>
- completeConnection · method · L37-L58 — static async completeConnection(platform: string, query: OAuthCallbackQuery): Promise<string>
- settings · function · L41-L41 — settings = (error: ConnectError)
- disconnect · method · L60-L65 — static async disconnect(user: AuthUser, brandId: string, platform: Platform): Promise<void>
- requireBrand · function · L69-L72 — async function requireBrand(user: AuthUser, brandId: string)
- accountNotFound · function · L74-L76 — function accountNotFound()
- checkAccount · function · L78-L89 — async function checkAccount(state: OAuthState, provider: Provider, account: ConnectedAccount): Promise<ConnectError | null>
- toRow · function · L91-L105 — function toRow(state: OAuthState, account: ConnectedAccount): NewSocialAccountRow
- settingsUrl · function · L107-L111 — function settingsUrl(brandId: string, params: Record<string, string>): string
- homeUrl · function · L113-L117 — function homeUrl(error: ConnectError): string
- toDetail · function · L120-L133 — function toDetail(row: SocialAccountRow): SocialAccountDetail
