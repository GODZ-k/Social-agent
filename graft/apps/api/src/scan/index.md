# apps/api/src/scan/index.ts

- discoverSite · function · L14-L24 — async function discoverSite(url: string, deadline: number): Promise<Discovery>
- siteNameCandidates · function · L26-L32 — function siteNameCandidates(pages: PageFacts[]): string[]
- collectPages · function · L34-L52 — function collectPages( home: PageFacts, fetched: PromiseSettledResult<FetchedPage>[], ): { pages: PageFacts[]; parseFailures: number }
- unreadPagesWarning · function · L54-L63 — function unreadPagesWarning( fetched: PromiseSettledResult<FetchedPage>[], parseFailures: number, deadline: number, ): string | undefined
- hasAnyDetail · function · L65-L65 — hasAnyDetail = (info: BusinessInfo)
- businessInfo · function · L67-L79 — function businessInfo(pages: PageFacts[]): BusinessInfo | undefined
- readSite · function · L82-L105 — async function readSite(discovery: Discovery, deadline: number): Promise<{ facts: SiteFacts; warnings: string[] }>
