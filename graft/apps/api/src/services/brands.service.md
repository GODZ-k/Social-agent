# apps/api/src/services/brands.service.ts

- BrandsService · class · L11-L69 — class BrandsService
- list · method · L12-L15 — static async list(user: AuthUser): Promise<Brand[]>
- listOwnedBy · method · L18-L21 — static async listOwnedBy(ownerId: string): Promise<Brand[]>
- create · method · L29-L41 — static async create(user: AuthUser, input: NewBrandInput, ownerId: string = user.id): Promise<Brand>
- get · method · L43-L49 — static async get(user: AuthUser, id: string): Promise<Brand>
- update · method · L52-L61 — static async update(user: AuthUser, id: string, patch: BrandPatch): Promise<Brand>
- archive · method · L63-L68 — static async archive(user: AuthUser, id: string): Promise<void>
- scopeFor · function · L75-L77 — function scopeFor(user: AuthUser): BrandScope
- brandNotFound · function · L80-L82 — function brandNotFound()
- accentFor · function · L85-L87 — function accentFor(brand: BrandKit)
- withAccounts · function · L99-L102 — async function withAccounts(rows: BrandRow[]): Promise<Brand[]>
- brandWithAccounts · function · L104-L107 — async function brandWithAccounts(row: BrandRow): Promise<Brand>
- toAccount · function · L110-L117 — function toAccount(row: SocialAccountRow): Brand["accounts"][number]
- toBrand · function · L120-L139 — function toBrand(row: BrandRow, accounts: SocialAccountRow[]): Brand
