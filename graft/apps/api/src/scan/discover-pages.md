# apps/api/src/scan/discover-pages.ts

- bareHost · function · L30-L30 — bareHost = (host: string)
- hasWord · function · L31-L31 — hasWord = (value: string, word: string)
- Link · type · L33-L33 — type Link = { url: string; path: string; text: string };
- sameSiteUrl · function · L36-L48 — function sameSiteUrl(href: string, home: URL): URL | undefined
- internalLinks · function · L51-L72 — function internalLinks(html: string, home: URL, homePath: string): Map<string, Link>
- depth · function · L74-L74 — depth = (link: Link)
- matchesGroup · function · L75-L76 — matchesGroup = (link: Link, words: string[])
- pickByGroup · function · L79-L90 — function pickByGroup(links: Link[]): Link[]
- pickPages · function · L92-L99 — function pickPages(homeUrl: string, html: string): string[]
