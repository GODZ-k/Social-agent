# apps/api/src/scan/firecrawl.ts

- Branding · type · L17-L20 — type Branding = { colors?: Partial<Record<"primary" | "secondary" | "accent" | "link" | "background" | "textPrimary", string>>; typography?: { fontStacks?: { heading?: string[]; body?: string[] } }; };
- FetchedPage · type · L22-L28 — type FetchedPage = { /** The address after redirects. */ url: string; html: string; links: string[]; branding?: Branding; };
- FirecrawlResponse · type · L30-L40 — type FirecrawlResponse = { success?: boolean; error?: string; code?: string; data?: { rawHtml?: string; links?: string[]; branding?: Branding; metadata?: { url?: string; statusCode?: number }; }; };
- parseUrl · function · L44-L50 — function parseUrl(rawUrl: string): URL
- assertPublicWebPort · function · L52-L56 — function assertPublicWebPort(url: URL): void
- assertPublicHost · function · L58-L75 — async function assertPublicHost(hostname: string): Promise<void>
- vetAddress · function · L78-L83 — async function vetAddress(rawUrl: string): Promise<URL>
- requestHeaders · function · L85-L90 — function requestHeaders(): Record<string, string>
- parseJson · function · L92-L98 — function parseJson(text: string): FirecrawlResponse
- postScrape · function · L100-L111 — async function postScrape(url: URL, formats: string[], timeoutMs: number): Promise<Response>
- readBody · function · L113-L119 — async function readBody(response: Response): Promise<string>
- isAccountOrOutage · function · L122-L124 — function isAccountOrOutage(status: number): boolean
- isSuccessStatus · function · L126-L126 — isSuccessStatus = (status: number)
- classifyResponse · function · L129-L136 — function classifyResponse(status: number, body: FirecrawlResponse, text: string): FirecrawlResponse | Error
- callFirecrawl · function · L138-L144 — async function callFirecrawl(url: URL, formats: string[], timeoutMs: number): Promise<FirecrawlResponse>
- finalUrl · function · L147-L150 — function finalUrl(reported: string | undefined, requested: URL): string
- fetchPage · function · L156-L179 — async function fetchPage(rawUrl: string, options: { deadline: number; withBranding?: boolean }): Promise<FetchedPage>
