# apps/api/src/repositories/brands.repository.ts

- BrandScope · type · L10-L10 — type BrandScope = "all" | { ownerId: string };
- inScope · function · L12-L12 — inScope = (scope: BrandScope)
- live · function · L15-L15 — live = (scope: BrandScope)
- byId · function · L17-L17 — byId = (id: string, scope: BrandScope)
- BrandsRepository · class · L20-L59 — class BrandsRepository
- list · method · L21-L23 — static async list(scope: BrandScope): Promise<BrandRow[]>
- findById · method · L25-L28 — static async findById(id: string, scope: BrandScope): Promise<BrandRow | undefined>
- create · method · L30-L34 — static async create(values: NewBrandRow): Promise<BrandRow>
- update · method · L37-L44 — static async update(id: string, scope: BrandScope, changes: Partial<NewBrandRow>): Promise<BrandRow | undefined>
- archive · method · L50-L58 — static async archive(id: string, scope: BrandScope): Promise<boolean>
