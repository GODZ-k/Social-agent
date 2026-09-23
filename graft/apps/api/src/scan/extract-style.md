# apps/api/src/scan/extract-style.ts

- Lightness · type · L23-L23 — type Lightness = { lightness: number; saturation: number };
- lightnessAndSaturation · function · L25-L34 — function lightnessAndSaturation(hex: string): Lightness
- isBrandColor · function · L36-L41 — function isBrandColor(hex: string): boolean
- brandColors · function · L43-L52 — function brandColors(branding: Branding | undefined): string[]
- cleanFamily · function · L54-L54 — cleanFamily = (name: string)
- isChosenFont · function · L55-L55 — isChosenFont = (name: string)
- firstChosenFont · function · L57-L59 — function firstChosenFont(stack: string[] | undefined): string | undefined
- loadedFontNames · function · L62-L83 — function loadedFontNames(html: string): string[]
- brandFonts · function · L85-L95 — function brandFonts(branding: Branding | undefined, html: string): { heading?: string; body?: string }
- buildStyleFacts · function · L98-L109 — function buildStyleFacts(branding: Branding | undefined, html: string): { style: StyleFacts; warnings: string[] }
