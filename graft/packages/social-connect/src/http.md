# packages/social-connect/src/http.ts

- SocialConnectError · class · L4-L12 — class SocialConnectError extends Error
- constructor · method · L7-L11 — constructor(network: string, status: number, message: string)
- postForm · function · L14-L17 — async function postForm(network: string, url: string, form: URLSearchParams): Promise<unknown>
- getJson · function · L19-L24 — async function getJson(network: string, url: string, query: Record<string, string>): Promise<unknown>
- readJson · function · L26-L30 — async function readJson(network: string, response: Response): Promise<unknown>
- errorMessage · function · L33-L37 — function errorMessage(body: unknown): string
