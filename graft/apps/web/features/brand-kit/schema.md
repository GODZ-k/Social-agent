# apps/web/features/brand-kit/schema.ts

- Values · type · L28-L28 — type Values = z.infer<typeof brandKitSchema>;
- toValues · function · L31-L44 — function toValues(scan: ScanResult, platforms: Platform[]): Values
- toBrandKit · function · L46-L55 — function toBrandKit(values: Values): BrandKit
- toPatch · function · L58-L60 — function toPatch(values: Values): Required<Pick<ClientPatch, "name" | "industry" | "brand" | "platforms">>
- toInput · function · L63-L65 — function toInput(values: Values, url: string): NewClientInput
