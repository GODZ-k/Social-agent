# apps/api/src/repositories/scans.repository.ts

- ScanScope · type · L7-L7 — type ScanScope = "all" | { requestedBy: string };
- inScope · function · L12-L12 — inScope = (scope: ScanScope)
- byId · function · L13-L13 — byId = (id: string, scope: ScanScope)
- isActive · function · L14-L14 — isActive = ()
- ScansRepository · class · L16-L74 — class ScansRepository
- create · method · L17-L21 — static async create(values: NewBrandScanRow): Promise<BrandScanRow>
- findById · method · L23-L26 — static async findById(id: string, scope: ScanScope): Promise<BrandScanRow | undefined>
- findActiveFor · method · L29-L37 — static async findActiveFor(requestedBy: string): Promise<BrandScanRow | undefined>
- markRunning · method · L39-L41 — static async markRunning(id: string): Promise<void>
- markStep · method · L43-L45 — static async markStep(id: string, step: ScanStepId): Promise<void>
- markDone · method · L47-L52 — static async markDone(id: string, result: ScanResult, pages: ScanPage[]): Promise<void>
- markFailed · method · L54-L59 — static async markFailed(id: string, error: string): Promise<void>
- attachBrand · method · L61-L63 — static async attachBrand(id: string, brandId: string): Promise<void>
- failInterrupted · method · L66-L73 — static async failInterrupted(): Promise<number>
