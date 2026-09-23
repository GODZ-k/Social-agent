# apps/api/src/services/scans.service.ts

- ScansService · class · L9-L31 — class ScansService
- start · method · L11-L18 — static async start(user: AuthUser, input: NewScanInput): Promise<{ scan: Scan; created: boolean }>
- get · method · L20-L23 — static async get(user: AuthUser, id: string): Promise<Scan>
- claim · method · L26-L30 — static async claim(user: AuthUser, id: string): Promise<BrandScanRow>
- findScan · function · L33-L38 — async function findScan(user: AuthUser, id: string): Promise<BrandScanRow>
- scopeFor · function · L41-L43 — function scopeFor(user: AuthUser): ScanScope
- scanNotFound · function · L46-L48 — function scanNotFound()
- isoOrNull · function · L50-L50 — isoOrNull = (date: Date | null)
- toScan · function · L53-L67 — function toScan(row: BrandScanRow): Scan
