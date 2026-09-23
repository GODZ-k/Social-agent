# apps/api/src/repositories/social-accounts.repository.ts

- SocialAccountsRepository · class · L7-L59 — class SocialAccountsRepository
- listByBrand · method · L8-L10 — static async listByBrand(brandId: string): Promise<SocialAccountRow[]>
- listVisibleByBrands · method · L13-L20 — static async listVisibleByBrands(brandIds: string[]): Promise<SocialAccountRow[]>
- findByBrandPlatform · method · L22-L29 — static async findByBrandPlatform(brandId: string, platform: Platform): Promise<SocialAccountRow | undefined>
- findByExternalAccount · method · L31-L38 — static async findByExternalAccount(platform: Platform, externalAccountId: string): Promise<SocialAccountRow | undefined>
- upsertConnected · method · L41-L50 — static async upsertConnected(values: NewSocialAccountRow): Promise<SocialAccountRow>
- disconnect · method · L53-L58 — static async disconnect(id: string): Promise<void>
